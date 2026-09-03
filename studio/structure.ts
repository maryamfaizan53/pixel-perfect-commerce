import type {StructureResolver} from 'sanity/structure'

/**
 * Desk structure: pin the Site Settings singleton, group the rest.
 */
export const structure: StructureResolver = (S) =>
  S.list()
    .title('Content')
    .items([
      S.listItem()
        .title('Site Settings')
        .id('siteSettings')
        .child(S.document().schemaType('siteSettings').documentId('siteSettings')),
      S.divider(),
      S.documentTypeListItem('product').title('Products'),
      S.documentTypeListItem('category').title('Categories'),
    ])
