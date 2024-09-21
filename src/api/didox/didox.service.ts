import { BadRequestException, Injectable } from '@nestjs/common';
import { getDidoxDocuments } from '../shared/utils/get-didox-documents';
import { getOneDocument } from '../shared/utils/get-one-document';
import { DOCUMENT_STATUS } from '../shared/constants/document-status';
import { ProductsService } from '../products/products.service';
import { PrismaService } from '../prisma/prisma.service';
import { getCategoryName } from '../shared/utils/get-category-name';
import { TaskService } from '../task/task.service';

@Injectable()
export class DidoxService {
  constructor(
    private readonly productService: ProductsService,
    private readonly prismaService: PrismaService,
    private readonly taskService: TaskService,
  ) {}
  async findAllDocuments(page: number, inn: string) {
    try {
      const data = await getDidoxDocuments(inn, page);

      return {
        data: data.data,
        pageSize: 20,
        current: page,
        total: data?.total,
      };
    } catch (err) {
      await this.taskService.tokenUpdater();
      throw new BadRequestException(err.message);
    }
  }

  async findOneDocument(inn: string, doc_id: string) {
    try {
      const data = await getOneDocument(inn, doc_id);
      const doc = await this.prismaService.fetchedDocuments.findUnique({
        where: { doc_id },
      });

      return {
        ...data.data,
        status: DOCUMENT_STATUS[data.data.document.status],
        fetched: doc?.doc_id ? true : false,
      };
    } catch (err) {
      await this.taskService.tokenUpdater();
      throw new BadRequestException(err.message);
    }
  }

  async createProducts(inn: string, docId: string) {
    try {
      const doc = await this.prismaService.fetchedDocuments.findUnique({
        where: { doc_id: docId },
      });
      if (doc)
        throw new BadRequestException('Maxsulotlar allaqachon qo`shilgan!');

      const {
        document: { status, doc_id, doctype },
        json: {
          productlist: { products },
        },
      } = await this.findOneDocument(inn, docId);

      if (status !== 3 && status !== 40)
        throw new BadRequestException('Faktura tasdiqlanmagan!');
      if (doctype !== '002')
        throw new BadRequestException('Bu fakturdan kirim qila olmaysiz!');

      await this.prismaService.$transaction(async (prisma) => {
        for await (const product of products) {
          const branch = await prisma.branches.findUnique({
            where: { inn },
          });
          let category = await prisma.categories.findUnique({
            where: { code: product.catalogcode.slice(0, 5) },
          });
          if (!category) {
            const catalogName = await getCategoryName(
              product.catalogcode.slice(0, 5),
            );

            category = await prisma.categories.create({
              data: {
                code: product.catalogcode.slice(0, 5),
                name: catalogName,
                branchId: branch.id,
              },
            });
          }
          const existProduct = await prisma.products.findFirst({
            where: { name: product.name },
          });

          if (existProduct && existProduct.name == product.name) {
            await prisma.products.update({
              where: { id: existProduct.id },
              data: { count: existProduct.count + Number(product.count) },
            });

            if (product.marks?.kiz) {
              await prisma.products.update({
                where: { id: existProduct.id },
                data: {
                  isMarked: true,
                },
              });
              for await (const mark of product.marks.kiz) {
                await prisma.productMarks.create({
                  data: {
                    label: mark,
                    productId: existProduct.id,
                  },
                });
              }
            }
          } else {
            const newProduct = await prisma.products.create({
              data: {
                name: product.name,
                catalogcode: product.barcode,
                packagecode: product.packagecode,
                count: +product.count,
                vat: +product.vatrate,
                categoryId: category.id,
                branchId: branch.id,
              },
            });

            if (product.marks?.kiz) {
              await prisma.products.update({
                where: { id: newProduct.id },
                data: {
                  isMarked: true,
                },
              });

              for await (const mark of product.marks.kiz) {
                await prisma.productMarks.create({
                  data: {
                    label: mark,
                    productId: newProduct.id,
                  },
                });
              }
            }
          }
        }

        await prisma.fetchedDocuments.create({ data: { doc_id } });
      });
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }
}
