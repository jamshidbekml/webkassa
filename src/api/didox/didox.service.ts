import { BadRequestException, Injectable } from '@nestjs/common';
import { getDidoxDocuments } from '../shared/utils/get-didox-documents';
import { getOneDocument } from '../shared/utils/get-one-document';
import { DOCUMENT_STATUS } from '../shared/constants/document-status';
import { ProductsService } from '../products/products.service';
import { PrismaService } from '../prisma/prisma.service';
import { getCategoryName } from '../shared/utils/get-category-name';

@Injectable()
export class DidoxService {
  constructor(
    private readonly productService: ProductsService,
    private readonly prismaService: PrismaService,
  ) {}
  async findAllDocuments(page: number, inn: string) {
    const data = await getDidoxDocuments(inn, page)

    return {
      data: data.data,
      pageSize: 20,
      current: page,
      total: data?.total,
    };
  }

  async findOneDocument(inn: string, doc_id: string) {
    const data = await getOneDocument(inn, doc_id);

    return {
      ...data.data,
      status: DOCUMENT_STATUS[data.data.document.status],
    };
  }

  async createProducts(inn: string, docId: string) {
    const doc = await this.prismaService.fetchedDocuments.findUnique({
      where: { doc_id: docId },
    });
    if (doc)
      throw new BadRequestException('Maxsulotlar allaqachon qo`shilgan!');

    const {
      document: { status, doc_id },
      json: {
        productlist: { products },
      },
    } = await this.findOneDocument(inn, docId);

    if (status !== 3) throw new BadRequestException('Faktura tasdiqlanmagan!');

    for await (const product of products) {
      const branch = await this.prismaService.branches.findUnique({
        where: { inn },
      });
      let category = await this.prismaService.categories.findUnique({
        where: { code: product.catalogcode.slice(0, 5) },
      });
      if (!category) {
        const catalogName = await getCategoryName(
          product.catalogcode.slice(0, 5),
        );

        category = await this.prismaService.categories.create({
          data: {
            code: product.catalogcode.slice(0, 5),
            name: catalogName,
            branchId: branch.id,
          },
        });
      }
      const existProduct = await this.prismaService.products.findUnique({
        where: { name: product.name },
      });

      if (existProduct) {
        await this.prismaService.products.update({
          where: { id: existProduct.id },
          data: { count: existProduct.count + Number(product.count) },
        });

        if (product.marks?.kiz) {
          await this.prismaService.products.update({
            where: { id: existProduct.id },
            data: {
              isMarked: true,
            },
          });
          for await (const mark of product.marks.kiz) {
            await this.prismaService.productMarks.create({
              data: {
                label: mark,
                productId: existProduct.id,
              },
            });
          }
        }
      } else {
        const newProduct = await this.productService.create({
          name: product.name,
          barcode: product.barcode,
          packagecode: product.packagecode,
          count: +product.count,
          vat: product.vatrate,
          categoryId: category.id,
          branchId: branch.id,
          catalogcode: product.catalogcode,
        });

        if (product.marks?.kiz) {
          await this.prismaService.products.update({
            where: { id: newProduct.id },
            data: {
              isMarked: true,
            },
          });
          for await (const mark of product.marks.kiz) {
            await this.prismaService.productMarks.create({
              data: {
                label: mark,
                productId: newProduct.id,
              },
            });
          }
        }
      }
    }

    await this.prismaService.fetchedDocuments.create({ data: { doc_id } });
  }
}
