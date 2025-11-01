import { createSchema, createYoga } from "graphql-yoga";

const CAT_API_KEY =
  "live_UiTHW0pEyWvmlHCs06sqnr3UazV3Fdf8I3qasOkOGVkumI0DZrWovno4DQssBS7J";

/* ============================================================
   DATA (in-memory) — Students
   ============================================================ */
const STUDENTS_DB = [
  { id: "1", name: "María López",   age: 20, program: "Comunicación",     gpa: 4.3, email: "maria.lopez@example.com" },
  { id: "2", name: "Juan Restrepo", age: 22, program: "Ing. Informática", gpa: 4.1, email: "juan.restrepo@example.com" },
  { id: "3", name: "Nicolás Urrea", age: 21, program: "Diseño",           gpa: 3.9, email: "nicolas.urrea@example.com" },
  { id: "4", name: "Samuel Acero",  age: 23, program: "Administración",   gpa: 4.5, email: "samuel.acero@example.com" }
];

/* ============================================================
   SCHEMA
   ============================================================ */
const typeDefs = /* GraphQL */ `
  "Raza de The Cat API"
  type CatBreed {
    id: ID
    name: String
  }

  "Categoría de The Cat API"
  type CatCategory {
    id: ID
    name: String
  }

  "Imagen devuelta por The Cat API"
  type CatImage {
    id: ID
    url: String
    width: Int
    height: Int
    breeds: [CatBreed!]
    categories: [CatCategory!]
  }

  "Estudiante de la DB local"
  type Student {
    id: ID!
    name: String!
    age: Int!
    program: String!
    gpa: Float!
    email: String!
  }

  type Query {
    "Imágenes de gatos. Si pasas breedId, filtra por raza"
    catImages(limit: Int = 3, breedId: ID): [CatImage!]!

    "Lista de razas (id, name) desde The Cat API"
    breeds: [CatBreed!]!

    "Siempre devuelve todos los estudiantes"
    students: [Student!]!

    "Búsqueda puntual por id (opcional para pruebas)"
    studentById(id: ID!): Student
  }
`;

/* ============================================================
   HELPERS
   ============================================================ */
async function fetchTheCatAPI(path) {
  const url = `https://api.thecatapi.com/v1${path}`;
  const resp = await fetch(url, { headers: { "x-api-key": CAT_API_KEY } });
  if (!resp.ok) {
    const txt = await resp.text().catch(() => "");
    throw new Error(`The Cat API error (${resp.status}): ${txt}`);
  }
  return resp.json();
}

/* ============================================================
   RESOLVERS
   ============================================================ */
const resolvers = {
  Query: {
    async catImages(_, { limit = 3, breedId }) {
      const safeLimit = Math.max(1, Math.min(20, Number(limit) || 3));
      const qs = new URLSearchParams({ limit: String(safeLimit) });
      if (breedId && String(breedId).trim()) qs.set("breed_ids", String(breedId).trim());
      return fetchTheCatAPI(`/images/search?${qs.toString()}`);
    },

    async breeds() {
      // The Cat API /breeds devuelve mucha info; aquí devolvemos {id, name}
      const data = await fetchTheCatAPI("/breeds");
      return (Array.isArray(data) ? data : []).map(b => ({ id: b.id, name: b.name }));
    },

    students() {
      // SIEMPRE regresa todos
      return STUDENTS_DB;
    },

    studentById(_, { id }) {
      return STUDENTS_DB.find(s => s.id === String(id)) || null;
    }
  }
};

/* ============================================================
   YOGA HANDLER (Vercel)
   ============================================================ */
const schema = createSchema({ typeDefs, resolvers });

export default createYoga({
  schema,
  graphqlEndpoint: "/api/graphql",
  cors: {
    origin: "*",          // abre CORS para front en otro dominio
    allowMethods: ["POST","GET","OPTIONS"],
    allowHeaders: ["content-type"]
  }
});
