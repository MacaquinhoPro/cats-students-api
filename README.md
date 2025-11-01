# Cats + Students API (GraphQL en Vercel)

## Scripts
- `npm run dev`  → corre en local con `vercel dev`

## Endpoints (una vez deployado)
- GraphQL: `/api/graphql`
- Health:  `/api/health`

## Ejemplos de query

### Gatos
```graphql
query ($n: Int!) {
  catImages(limit: $n) {
    id
    url
    width
    height
    breeds { id name }
    categories { id name }
  }
}
