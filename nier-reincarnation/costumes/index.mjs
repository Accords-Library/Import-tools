import 'dotenv/config';
import { NIERREIN_GUIDE_API_URL, NIERREIN_GUIDE_CDN_URL } from '../../config.mjs';
import { env } from '../../env.mjs';
import slugg from 'slugg';

let currentIndex = 1;

const { data: emblems } = await fetch(
  `${env.STRAPI_BASE_API_URL}/rein-emblems`,
  {
    headers: {
      Authorization:
        `bearer ${env.STRAPI_API_TOKEN}`,
    },
  }
)
  .then((res) => res.json())
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

if (!emblems || emblems.length === 0) {
  console.error(`Got 0 emblems from "${env.STRAPI_BASE_API_URL}/rein-emblems". You may want to run "npm run import:emblems".`)
  process.exit(1);
}

let costumes = [];

try {
  console.log('Fetching NieR Re[in]carnation costumes...')
  costumes = await fetch(`${NIERREIN_GUIDE_API_URL}/costumes`)
    .then((response) => response.json())
} catch (error) {
  console.error(error)
  process.exit(1);
}

console.log(`${costumes.length} costumes fetched from "${NIERREIN_GUIDE_API_URL}/costumes"`)

if (costumes.length === 0) {
  console.error(`Got 0 costume from "${NIERREIN_GUIDE_API_URL}/costumes". Their database is probably in the process of being updated. Try again in 10 minutes.`)
  process.exit(1);
}

for (const costume of costumes) {
  if (!currentIndex > 1) continue

  console.log(`Uploading n°${currentIndex}/${costumes.length} costumes.`);

  // Get costume image blob for the sprite
  const file = await fetch(`${NIERREIN_GUIDE_CDN_URL}${costume.image_path_base}full.png`).then(
    (response) => response.blob()
  );

  const body = new FormData();

  let costumeEmblem = {}

  if (costume.emblem_id) {
    costumeEmblem = emblems.find((emblem) => emblem.attributes.slug === slugg(costume.emblem.name))
  }

  // Create the weapon-stories entry
  body.append(
    "data",
    JSON.stringify({
      slug: costume.slug,
      translations: [
        {
          language: {
            connect: [2], // en
          },
          name: costume.title,
          description:
            costume.description?.replaceAll(
              "\\n",
              "<br>"
            ),
        },
      ],
      emblem: {
        connect: [costumeEmblem.id].filter(Boolean),
      },
    })
  );

  // Add the weapon image blob
  body.append("files.sprite", file, `${costume.slug}.png`);

  const response = await fetch(
    `${env.STRAPI_BASE_API_URL}/rein-costumes`,
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
        `[DUPLICATE] ${costume.name} (${costume.slug}) already exists.`
      );

      continue
    }

    console.error(`[ERROR] ${costume.title} (${costume.slug}):`, response.error.message)
  } else {
    console.log(`[ADDED] "${costume.title}" (${costume.slug})`);
  }
}