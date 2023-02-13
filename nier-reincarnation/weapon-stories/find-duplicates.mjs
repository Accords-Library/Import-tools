import "dotenv/config";

const response = await fetch(`${process.env.STRAPI_GRAPHQL}`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `bearer ${process.env.STRAPI_API_TOKEN}`,
  },
  body: JSON.stringify({
    query: `{
        weaponStories(pagination: { limit: -1 }) {
          data {
            id
            attributes {
              slug
              name { name }
            }
          }
        }
      }`,
  }),
});

const normalizeName = (name) => {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/['’]/g, "'");
};

const weapons = (await response.json()).data.weaponStories.data;

const nameMap = new Map();

for (const weapon of weapons) {
  for (const { name } of weapon.attributes.name) {
    if (name === undefined || name === null) {
      console.warn(name, "is nullable", weapon);
    }

    const normalizedName = normalizeName(name);

    if (nameMap.has(normalizedName))
      console.warn(`
Duplicate names ${normalizedName} in:
 1. ${nameMap.get(normalizedName).attributes.slug}
 2. ${weapon.attributes.slug}`);
    else {
      nameMap.set(normalizedName, weapon);
    }
  }
}
