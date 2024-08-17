export interface GetAllDocumentsFromDidox {
  data: any[];
  total: number;
}

export interface IDocument {
  data: {
    json: {
      productlist: {
        products: {
          name: string;
          catalogcode: string;
          catalogname: string;
          marks: { kiz: string[] };
          barcode: string;
          packagecode: string;
          count: number;
          vatrate: number;
        }[];
      };
    };
    document: {
      status: number;
      doc_id: string;
      doctype: string;
    };
  };
}
