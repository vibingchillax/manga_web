async function createMangaTags() {
  try {
    await prisma.tag.createMany({
      data: [
        {
          id: "0234a31e-a729-4e28-9d6a-3f87c4966b9e",
          name: {
            en: "Oneshot",
          },
          description: {},
          group: "format",
        },
        {
          id: "07251805-a27e-4d59-b488-f0bfbec15168",
          name: {
            en: "Thriller",
          },
          description: {},
          group: "genre",
        },
        {
          id: "0a39b5a1-b235-4886-a747-1d05d216532d",
          name: {
            en: "Award Winning",
          },
          description: {},
          group: "format",
        },
        {
          id: "0bc90acb-ccc1-44ca-a34a-b9f3a73259d0",
          name: {
            en: "Reincarnation",
          },
          description: {},
          group: "theme",
        },
        {
          id: "256c8bd9-4904-4360-bf4f-508a76d67183",
          name: {
            en: "Sci-Fi",
          },
          description: {},
          group: "genre",
        },
        {
          id: "292e862b-2d17-4062-90a2-0356caa4ae27",
          name: {
            en: "Time Travel",
          },
          description: {},
          group: "theme",
        },
        {
          id: "2bd2e8d0-f146-434a-9b51-fc9ff2c5fe6a",
          name: {
            en: "Genderswap",
          },
          description: {},
          group: "theme",
        },
        {
          id: "2d1f5d56-a1e5-4d0d-a961-2193588b08ec",
          name: {
            en: "Loli",
          },
          description: {},
          group: "theme",
        },
        {
          id: "31932a7e-5b8e-49a6-9f12-2afa39dc544c",
          name: {
            en: "Traditional Games",
          },
          description: {},
          group: "theme",
        },
        {
          id: "320831a8-4026-470b-94f6-8353740e6f04",
          name: {
            en: "Official Colored",
          },
          description: {},
          group: "format",
        },
        {
          id: "33771934-028e-4cb3-8744-691e866a923e",
          name: {
            en: "Historical",
          },
          description: {},
          group: "genre",
        },
        {
          id: "36fd93ea-e8b8-445e-b836-358f02b3d33d",
          name: {
            en: "Monsters",
          },
          description: {},
          group: "theme",
        },
        {
          id: "391b0423-d847-456f-aff0-8b0cfc03066b",
          name: {
            en: "Action",
          },
          description: {},
          group: "genre",
        },
        {
          id: "39730448-9a5f-48a2-85b0-a70db87b1233",
          name: {
            en: "Demons",
          },
          description: {},
          group: "theme",
        },
        {
          id: "3b60b75c-a2d7-4860-ab56-05f391bb889c",
          name: {
            en: "Psychological",
          },
          description: {},
          group: "genre",
        },
        {
          id: "3bb26d85-09d5-4d2e-880c-c34b974339e9",
          name: {
            en: "Ghosts",
          },
          description: {},
          group: "theme",
        },
        {
          id: "3de8c75d-8ee3-48ff-98ee-e20a65c86451",
          name: {
            en: "Animals",
          },
          description: {},
          group: "theme",
        },
        {
          id: "3e2b8dae-350e-4ab8-a8ce-016e844b9f0d",
          name: {
            en: "Long Strip",
          },
          description: {},
          group: "format",
        },
        {
          id: "423e2eae-a7a2-4a8b-ac03-a8351462d71d",
          name: {
            en: "Romance",
          },
          description: {},
          group: "genre",
        },
        {
          id: "489dd859-9b61-4c37-af75-5b18e88daafc",
          name: {
            en: "Ninja",
          },
          description: {},
          group: "theme",
        },
        {
          id: "4d32cc48-9f00-4cca-9b5a-a839f0764984",
          name: {
            en: "Comedy",
          },
          description: {},
          group: "genre",
        },
        {
          id: "50880a9d-5440-4732-9afb-8f457127e836",
          name: {
            en: "Mecha",
          },
          description: {},
          group: "genre",
        },
        {
          id: "51d83883-4103-437c-b4b1-731cb73d786c",
          name: {
            en: "Anthology",
          },
          description: {},
          group: "format",
        },
        {
          id: "5920b825-4181-4a17-beeb-9918b0ff7a30",
          name: {
            en: "Boys' Love",
          },
          description: {},
          group: "genre",
        },
        {
          id: "5bd0e105-4481-44ca-b6e7-7544da56b1a3",
          name: {
            en: "Incest",
          },
          description: {},
          group: "theme",
        },
        {
          id: "5ca48985-9a9d-4bd8-be29-80dc0303db72",
          name: {
            en: "Crime",
          },
          description: {},
          group: "genre",
        },
        {
          id: "5fff9cde-849c-4d78-aab0-0d52b2ee1d25",
          name: {
            en: "Survival",
          },
          description: {},
          group: "theme",
        },
        {
          id: "631ef465-9aba-4afb-b0fc-ea10efe274a8",
          name: {
            en: "Zombies",
          },
          description: {},
          group: "theme",
        },
        {
          id: "65761a2a-415e-47f3-bef2-a9dababba7a6",
          name: {
            en: "Reverse Harem",
          },
          description: {},
          group: "theme",
        },
        {
          id: "69964a64-2f90-4d33-beeb-f3ed2875eb4c",
          name: {
            en: "Sports",
          },
          description: {},
          group: "genre",
        },
        {
          id: "7064a261-a137-4d3a-8848-2d385de3a99c",
          name: {
            en: "Superhero",
          },
          description: {},
          group: "genre",
        },
        {
          id: "799c202e-7daa-44eb-9cf7-8a3c0441531e",
          name: {
            en: "Martial Arts",
          },
          description: {},
          group: "theme",
        },
        {
          id: "7b2ce280-79ef-4c09-9b58-12b7c23a9b78",
          name: {
            en: "Fan Colored",
          },
          description: {},
          group: "format",
        },
        {
          id: "81183756-1453-4c81-aa9e-f6e1b63be016",
          name: {
            en: "Samurai",
          },
          description: {},
          group: "theme",
        },
        {
          id: "81c836c9-914a-4eca-981a-560dad663e73",
          name: {
            en: "Magical Girls",
          },
          description: {},
          group: "genre",
        },
        {
          id: "85daba54-a71c-4554-8a28-9901a8b0afad",
          name: {
            en: "Mafia",
          },
          description: {},
          group: "theme",
        },
        {
          id: "87cc87cd-a395-47af-b27a-93258283bbc6",
          name: {
            en: "Adventure",
          },
          description: {},
          group: "genre",
        },
        {
          id: "891cf039-b895-47f0-9229-bef4c96eccd4",
          name: {
            en: "Self-Published",
          },
          description: {},
          group: "format",
        },
        {
          id: "8c86611e-fab7-4986-9dec-d1a2f44acdd5",
          name: {
            en: "Virtual Reality",
          },
          description: {},
          group: "theme",
        },
        {
          id: "92d6d951-ca5e-429c-ac78-451071cbf064",
          name: {
            en: "Office Workers",
          },
          description: {},
          group: "theme",
        },
        {
          id: "9438db5a-7e2a-4ac0-b39e-e0d95a34b8a8",
          name: {
            en: "Video Games",
          },
          description: {},
          group: "theme",
        },
        {
          id: "9467335a-1b83-4497-9231-765337a00b96",
          name: {
            en: "Post-Apocalyptic",
          },
          description: {},
          group: "theme",
        },
        {
          id: "97893a4c-12af-4dac-b6be-0dffb353568e",
          name: {
            en: "Sexual Violence",
          },
          description: {},
          group: "content",
        },
        {
          id: "9ab53f92-3eed-4e9b-903a-917c86035ee3",
          name: {
            en: "Crossdressing",
          },
          description: {},
          group: "theme",
        },
        {
          id: "a1f53773-c69a-4ce5-8cab-fffcd90b1565",
          name: {
            en: "Magic",
          },
          description: {},
          group: "theme",
        },
        {
          id: "a3c67850-4684-404e-9b7f-c69850ee5da6",
          name: {
            en: "Girls' Love",
          },
          description: {},
          group: "genre",
        },
        {
          id: "aafb99c1-7f60-43fa-b75f-fc9502ce29c7",
          name: {
            en: "Harem",
          },
          description: {},
          group: "theme",
        },
        {
          id: "ac72833b-c4e9-4878-b9db-6c8a4a99444a",
          name: {
            en: "Military",
          },
          description: {},
          group: "theme",
        },
        {
          id: "acc803a4-c95a-4c22-86fc-eb6b582d82a2",
          name: {
            en: "Wuxia",
          },
          description: {},
          group: "genre",
        },
        {
          id: "ace04997-f6bd-436e-b261-779182193d3d",
          name: {
            en: "Isekai",
          },
          description: {},
          group: "genre",
        },
        {
          id: "b11fda93-8f1d-4bef-b2ed-8803d3733170",
          name: {
            en: "4-Koma",
          },
          description: {},
          group: "format",
        },
        {
          id: "b13b2a48-c720-44a9-9c77-39c9979373fb",
          name: {
            en: "Doujinshi",
          },
          description: {},
          group: "format",
        },
        {
          id: "b1e97889-25b4-4258-b28b-cd7f4d28ea9b",
          name: {
            en: "Philosophical",
          },
          description: {},
          group: "genre",
        },
        {
          id: "b29d6a3d-1569-4e7a-8caf-7557bc92cd5d",
          name: {
            en: "Gore",
          },
          description: {},
          group: "content",
        },
        {
          id: "b9af3a63-f058-46de-a9a0-e0c13906197a",
          name: {
            en: "Drama",
          },
          description: {},
          group: "genre",
        },
        {
          id: "c8cbe35b-1b2b-4a3f-9c37-db84c4514856",
          name: {
            en: "Medical",
          },
          description: {},
          group: "genre",
        },
        {
          id: "caaa44eb-cd40-4177-b930-79d3ef2afe87",
          name: {
            en: "School Life",
          },
          description: {},
          group: "theme",
        },
        {
          id: "cdad7e68-1419-41dd-bdce-27753074a640",
          name: {
            en: "Horror",
          },
          description: {},
          group: "genre",
        },
        {
          id: "cdc58593-87dd-415e-bbc0-2ec27bf404cc",
          name: {
            en: "Fantasy",
          },
          description: {},
          group: "genre",
        },
        {
          id: "d14322ac-4d6f-4e9b-afd9-629d5f4d8a41",
          name: {
            en: "Villainess",
          },
          description: {},
          group: "theme",
        },
        {
          id: "d7d1730f-6eb0-4ba6-9437-602cac38664c",
          name: {
            en: "Vampires",
          },
          description: {},
          group: "theme",
        },
        {
          id: "da2d50ca-3018-4cc0-ac7a-6b7d472a29ea",
          name: {
            en: "Delinquents",
          },
          description: {},
          group: "theme",
        },
        {
          id: "dd1f77c5-dea9-4e2b-97ae-224af09caf99",
          name: {
            en: "Monster Girls",
          },
          description: {},
          group: "theme",
        },
        {
          id: "ddefd648-5140-4e5f-ba18-4eca4071d19b",
          name: {
            en: "Shota",
          },
          description: {},
          group: "theme",
        },
        {
          id: "df33b754-73a3-4c54-80e6-1a74a8058539",
          name: {
            en: "Police",
          },
          description: {},
          group: "theme",
        },
        {
          id: "e197df38-d0e7-43b5-9b09-2842d0c326dd",
          name: {
            en: "Web Comic",
          },
          description: {},
          group: "format",
        },
        {
          id: "e5301a23-ebd9-49dd-a0cb-2add944c7fe9",
          name: {
            en: "Slice of Life",
          },
          description: {},
          group: "genre",
        },
        {
          id: "e64f6742-c834-471d-8d72-dd51fc02b835",
          name: {
            en: "Aliens",
          },
          description: {},
          group: "theme",
        },
        {
          id: "ea2bc92d-1c26-4930-9b7c-d5c0dc1b6869",
          name: {
            en: "Cooking",
          },
          description: {},
          group: "theme",
        },
        {
          id: "eabc5b4c-6aff-42f3-b657-3e90cbd00b75",
          name: {
            en: "Supernatural",
          },
          description: {},
          group: "theme",
        },
        {
          id: "ee968100-4191-4968-93d3-f82d72be7e46",
          name: {
            en: "Mystery",
          },
          description: {},
          group: "genre",
        },
        {
          id: "f4122d1c-3b44-44d0-9936-ff7502c39ad3",
          name: {
            en: "Adaptation",
          },
          description: {},
          group: "format",
        },
        {
          id: "f42fbf9e-188a-447b-9fdc-f19dc1e4d685",
          name: {
            en: "Music",
          },
          description: {},
          group: "theme",
        },
        {
          id: "f5ba408b-0e7a-484d-8d49-4e9125ac96de",
          name: {
            en: "Full Color",
          },
          description: {},
          group: "format",
        },
        {
          id: "f8f62932-27da-4fe4-8ee1-6779a8c5edba",
          name: {
            en: "Tragedy",
          },
          description: {},
          group: "genre",
        },
        {
          id: "fad12b5e-68ba-460e-b933-9ae8318f5b65",
          name: {
            en: "Gyaru",
          },
          description: {},
          group: "theme",
        },
      ],
      skipDuplicates: true,
    });
    console.log("[Manga Tags] Added 76 tags");
  } catch {}
}

export default defineTask({
  meta: {
    name: "db:seed",
    description: "Seed database",
  },
  async run() {
    await createMangaTags();
    return {
      result: "ok",
    };
  },
});
