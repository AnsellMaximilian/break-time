import { Client, Databases, Permission, Role, Account, ID  } from 'node-appwrite';

export default async ({ req, res, log, error }) => {
  const client = new Client()
     .setEndpoint('https://cloud.appwrite.io/v1')
     .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
     .setKey(process.env.APPWRITE_API_KEY);

  const databases = new Databases(client)
  const account = new Account(client)

  if(req.method === "POST"){
    try {
      const {username, email, password } = JSON.parse(req.body);

      const id = ID.unique();
  
      const createdUser = await account.create(id, email, password);

      const createdUserProfile = await databases.createDocument(
          process.env.DB_ID,
          process.env.USER_PROFILE_COLLECTION_ID,
          createdUser.$id,
          {
            username
          },
          [
            Permission.read(Role.any()), Permission.update(Role.user(createdUser.$id))
          ]
      )
  
      return res.json({
        success: true,
        data: {
          user: {...createdUser, profile: createdUserProfile}
        }
      });
    } catch (e) {
      error("Failed to create document: " + e.message)
      return res.json({
        success: false,
        data: null,
        note: e?.message
      })
    }
  }else {
    return res.send("Failed")
  }
};
