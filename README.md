# [The Pinata Challenge](https://dev.to/challenges/pinata)

## Quick Links
- [Live App](https://pinata-breaktime.vercel.app/)
- [Github Repo](https://github.com/AnsellMaximilian/break-time)
- [Pinata](https://pinata.cloud/)

## What I Built
*Break Time* is a web app for creating **digital time capsules** (called Pinatas) to store and cherish memories. Pinatas are opened on a future date to relive those memories, making sure your digital footprints remain meaningful.

### Example Usage
You can create a Pinata named **"John and Jill’s 5th Anniversary"**, where friends store messages, photos, or videos leading up to their 5th anniversary. Only John and Jill can open it after five years, unlocking all the memories inside.

The app allows contributors to add memories, with customizable settings for contribution timelines and who can open the Pinata.

## Demo
[Demo Video on YouTube](https://youtu.be/Uad3h0LjhaE)

### Screenshots
#### Home Page
![Home](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/yeiekkho30w5l204lxq6.png)

#### Dashboard
![Dashboard](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/6obs4tjzdk2as92yt893.png)

#### Create Pinata
![Create Pinata](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/jd1jx2ori8y0f4d4db9p.png)

## Tech Stack
- **Next.js** for frontend and secure route handlers
- **Appwrite** for authentication and metadata storage
- **Pinata** for file storage on IPFS

### Example Code for Route Handlers
```typescript
export async function GET() {
  const keyData = await pinata.keys.create({
    keyName: crypto.randomUUID().toString(),
    permissions: { endpoints: { pinning: { pinFileToIPFS: true } } },
    maxUses: 1,
  });
  return NextResponse.json(keyData);
}
