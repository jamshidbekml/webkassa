import { BadRequestException, Injectable } from '@nestjs/common';
import { getDidoxDocuments } from '../shared/utils/get-didox-documents';
import { getOneDocument } from '../shared/utils/get-one-document';
import { DOCUMENT_STATUS } from '../shared/constants/document-status';
import { ProductsService } from '../products/products.service';

@Injectable()
export class DidoxService {
  constructor(private readonly productService: ProductsService) {}
  async findAllDocuments(page: number, inn: string) {
    const data = await getDidoxDocuments(inn, page);

    const pageCount = Math.ceil(data.total / 15);

    return {
      data: data.data,
      pageCount,
      currentPage: page,
      total: data.total,
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
    const {
      document: { status, doc_id },
      json: {
        productlist: { products },
      },
    } = await this.findOneDocument(inn, docId);

    if (status !== 3) throw new BadRequestException('Faktura tasdiqlanmagan!');

    // for await (const product of products) {
    //   await this.productService.create({
    //     name: product.name,
    //     barcode: product.barcode,
    //     packagecode: product.packagecode,
    //     count: product.count,
    //     vat: product.vatrate,
    //   });
    // }
  }
}
