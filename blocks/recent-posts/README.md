# recent-posts

Custom **recent-posts** block. 

## Authoring (Document Authoring)

Model: `standalone`

Single block table. Content: one row, one cell of content.

## Supported variations

No variations.

## Universal Editor fields

N/A (Document Authoring project)

## Block configuration

The block is a key/value config table. Post content is never authored here; it is pulled in at runtime.

| Recent Posts |   |
| --- | --- |
| count | 2 |
| index | /query-index.json |

- `count` (optional, default `2`): how many of the newest posts to show.
- `index` (optional, default `/query-index.json`): the query index to read posts from.

Posts are entries whose path matches `/yyyy/mm/slug`, sorted newest first by `publicationDate`
(falling back to the path's year/month, then `lastModified`). Each post renders as a date line
above a card holding the linked title and the full post body.
