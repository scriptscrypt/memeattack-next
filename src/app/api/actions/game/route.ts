import { envEnviroment } from "@/lib/envConfig/envConfig";
import {
  ActionPostResponse,
  ACTIONS_CORS_HEADERS,
  createPostResponse,
  ActionGetResponse,
  ActionPostRequest,
} from "@solana/actions";
import {
  clusterApiUrl,
  Connection,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import { NextResponse } from "next/server";

export const GET = async (req: Request) => {
  const requestUrl = new URL(req.url);
  const baseHref = new URL(`/api/actions`, requestUrl.origin).toString();

  const payload: ActionGetResponse = {
    type: "action",
    title: `MemeAttack`,
    icon: new URL("/api/og", new URL(req.url).origin).toString(),
    description: `\n Choose your Tile and Action`,
    label: "Enter your Telegram userId",
    links: {
      actions: [
        {
          label: "Claim",
          href: `${baseHref}/game?paramTile={paramTile}&paramFirstAction={paramFirstAction}`,
          parameters: [
            {
              type: "select",
              name: "paramTile",
              label: "Select a Tile",
              required: true,
              options: [
                {
                  label: "1",
                  value: "1",
                },
                {
                  label: "2",
                  value: "2",
                },
                {
                  label: "3",
                  value: "3",
                },
                {
                  label: "4",
                  value: "4",
                },
                {
                  label: "5",
                  value: "5",
                },
                {
                  label: "6",
                  value: "6",
                },
                {
                  label: "7",
                  value: "7",
                },
                {
                  label: "8",
                  value: "8",
                },
                {
                  label: "9",
                  value: "9",
                },
              ],
            },
          ],
        },
        {
          label: "Defend",
          href: `${baseHref}/game?paramTile={paramTile}&paramFirstAction={defend}`,
        },
        {
          label: "Attack",
          href: `${baseHref}/game?paramTile={paramTile}&paramFirstAction={attack}`,
        },
      ],
    },
  };

  return Response.json(payload, {
    headers: ACTIONS_CORS_HEADERS,
  });
};

// DO NOT FORGET TO INCLUDE THE `OPTIONS` HTTP METHOD
// THIS WILL ENSURE CORS WORKS FOR BLINKS
export const OPTIONS = GET;

export const POST = async (req: Request) => {
  const requestUrl = new URL(req.url);
  const baseHref = new URL(`/api/actions`, requestUrl.origin).toString();

  // Get the 'paramTile' parameter from the URL
  const userChoice = requestUrl.searchParams.get("paramTile");
  console.log(`User's choice: ${userChoice}`);

  // Ensure userChoice is valid
  const validChoices = Array.from({ length: 9 }, (_, i) => i + 1);
  if (!userChoice || !validChoices.includes(Number(userChoice))) {
    return NextResponse?.json(
      {
        message: "Invalid choice. Please select tiles from 1 to 9.",
      },
      {
        headers: ACTIONS_CORS_HEADERS,
        status: 400,
      }
    );
  }

  // Randomly select a choice for the server
  const serverChoice =
    validChoices[Math.floor(Math.random() * validChoices.length)];
  console.log(`Server's choice: ${serverChoice}`);

  // Determine the result
  // const result = utilDetermineWinner(userChoice, serverChoice);
  const result = Number(userChoice) === serverChoice ? "draw" : userChoice;
  console.log(`Game result: ${result}`);

  // Transaction part for SOL tx:
  const connection = new Connection(
    process.env.SOLANA_RPC! ||
      clusterApiUrl(envEnviroment === "production" ? "mainnet-beta" : "devnet")
  );
  console.log("Connection established with Solana network");

  // Get recent blockhash
  const transaction = new Transaction();
  console.log("Transaction object created");

  // Set the end user as the fee payer
  const body: ActionPostRequest = await req.json();
  console.log("Request body:", body);

  const account = new PublicKey(body.account);
  console.log(`Account public key:`, account.toBase58());

  // Create transaction
  transaction.add(
    SystemProgram.transfer({
      fromPubkey: account,
      toPubkey: account,
      lamports: 0.0001 * LAMPORTS_PER_SOL,
    })
  );

  transaction.add(
    SystemProgram.transfer({
      fromPubkey: account,
      toPubkey: new PublicKey("39G4S57hEMsbD1npzi22heiEvjAHnnTG3ixciDHozcNj"),
      lamports: 0.0001 * LAMPORTS_PER_SOL,
    })
  );

  transaction.feePayer = account;
  transaction.recentBlockhash = (
    await connection.getLatestBlockhash()
  ).blockhash;
  console.log("Set fee payer and recent blockhash");

  // Conditional payload based on the game result
  let payload: ActionPostResponse;

  if (result === "won") {
    payload = await createPostResponse({
      fields: {
        transaction,
        message: `You chose ${userChoice}, the Server Blinked ${serverChoice}. Result: ${result}`,
        links: {
          next: {
            action: {
              type: "completed",
              title: `Rock paper scissors #2`,
              icon: new URL("/win.png", new URL(req.url).origin).toString(),
              description: `You chose ${userChoice}, the Server Blinked ${serverChoice}. Result: ${result}`,
              label: "Yayy",
            },
            type: "inline",
          },
        },
      },
    });
  } else {
    payload = await createPostResponse({
      fields: {
        transaction,
        message: "Rock paper scissors",
        links: {
          next: {
            action: {
              type: "action",
              title: `Rock paper scissors`,
              icon: new URL("/initial.png", new URL(req.url).origin).toString(),
              description: `\nPlay Rock Paper Scissors, You've got another chance! to Win Big!`,
              label: "Select Action",
              links: {
                actions: [
                  {
                    label: "Rock paper scissors",
                    href: `${baseHref}/rps?paramRPS={paramRPS}`,
                    parameters: [
                      {
                        type: "radio",
                        name: "paramRPS",
                        label: "Rock? paper? scissors?",
                        required: true,
                        options: [
                          {
                            label: "Rock",
                            value: "rock",
                          },
                          {
                            label: "Paper",
                            value: "paper",
                          },
                          {
                            label: "Scissors",
                            value: "scissors",
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            },

            type: "inline",
          },
        },
      },
    });
  }
  console.log("Post response payload:", payload);

  return Response.json(payload, {
    headers: ACTIONS_CORS_HEADERS,
  });
};
