import { envEnviroment } from "@/lib/envConfig/envConfig";
import {
  ActionPostRequest,
  ACTIONS_CORS_HEADERS,
  createPostResponse,
} from "@solana/actions";
import {
  Transaction,
  SystemProgram,
  PublicKey,
  LAMPORTS_PER_SOL,
  Connection,
  clusterApiUrl,
} from "@solana/web3.js";

export const OPTIONS = async (req: Request, { params }: any) => {
  const { paramTile, paramAmount, paramMemecoin } = params;
  return new Response(null, {
    headers: ACTIONS_CORS_HEADERS,
  });
};


export const POST = async (req: Request, { params }: any) => {
  const { paramTile, paramAmount, paramMemecoin } = params;

  const connection = new Connection(
    process.env.SOLANA_RPC! ||
      clusterApiUrl(envEnviroment === "production" ? "mainnet-beta" : "devnet")
  );
  console.log("Connection established with Solana network");

  const transaction = new Transaction();
  const body: ActionPostRequest = await req.json();
  const account = new PublicKey(body.account);

  // Create transaction
  transaction.add(
    SystemProgram.transfer({
      fromPubkey: account,
      toPubkey: account,
      lamports: 0.0001 * LAMPORTS_PER_SOL,
    })
  );

  // Set the end user as the fee payer
  transaction.feePayer = account;
  // Get recent blockhash
  transaction.recentBlockhash = (
    await connection.getLatestBlockhash()
  ).blockhash;

  const payload = createPostResponse({
    fields: {
      transaction,
      message: `You chose ${paramTile}, ${paramAmount} for ${paramMemecoin}`,
      links: {
        next: {
          action: {
            type: "completed",
            title: `Your attack is successful! Timer Resets`,
            icon: new URL("/win.png", new URL(req.url).origin).toString(),
            description: `You chose ${paramTile}, ${paramAmount} for ${paramMemecoin}`,
            label: "Yayy",
          },
          type: "inline",
        },
      },
    },
  });

  return Response.json(payload, {
    headers: ACTIONS_CORS_HEADERS,
  });
};
