import 'dotenv/config';
import { NIERREIN_GUIDE_API_URL } from '../../config.mjs';
import { env } from '../../env.mjs';
import slugg from 'slugg';

let currentIndex = 1;

let emblems = [];

try {
  console.log('Fetching NieR Re[in]carnation emblems...')
  emblems = await fetch(`${NIERREIN_GUIDE_API_URL}/emblems`)
    .then((response) => response.json())
} catch (error) {
  console.error(error)
  process.exit(1);
}

console.log(`${emblems.length} emblems fetched from "${NIERREIN_GUIDE_API_URL}/emblems"`)

if (emblems.length === 0) {
  console.error(`Got 0 emblem from "${NIERREIN_GUIDE_API_URL}/emblems". Their database is probably in the process of being updated. Try again in 10 minutes.`)
  process.exit(1);
}

for (const emblem of emblems) {
  if (!currentIndex > 1) continue

  console.log(`Uploading n°${currentIndex}/${emblems.length} emblems.`);

  const body = new FormData();

  const description = `
    ${emblem.main_message?.replaceAll("\\n", "<br>")}<br>${emblem.small_messages?.replaceAll("\\n", "<br>")}
  `.trim()

  // Create the emblem entry
  body.append(
    "data",
    JSON.stringify({
      slug: slugg(emblem.name),
      translations: [
        {
          language: {
            connect: [2], // en
          },
          name: emblem.name,
          description,
        },
      ],
    })
  );

  const response = await fetch(
    `${env.STRAPI_BASE_API_URL}/rein-emblems`,
    {
      method: "POST",
      body,
      headers: {
        Authorization:
          `bearer ${env.STRAPI_API_TOKEN}`,
      },
    }
  )
    .then((res) => res.json())
    .catch((err) => err?.json());

  currentIndex++;

  if (response?.error) {
    if (response.error.message === "This attribute must be unique") {
      console.warn(
        `[DUPLICATE] ${emblem.name} already exists.`
      );

      continue
    }

    console.error(`[ERROR] ${emblem.name}:`, response.error.message)
  } else {
    console.log(`[ADDED] "${emblem.name}"`);
  }
}