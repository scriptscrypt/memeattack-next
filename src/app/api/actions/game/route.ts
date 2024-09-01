import { envEnviroment } from "@/lib/envConfig/envConfig";
import {
  createEnterGameInstruction,
  PROGRAM_ID,
} from "@/lib/program/programInstructions";
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
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionInstruction,
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
    label: "Next",
    links: {
      actions: [
        {
          label: "Next",
          href: `${baseHref}/game?paramFirstAction={paramFirstAction}`,
          parameters: [
            {
              type: "select",
              name: "paramFirstAction",
              label: "Select an Action",
              required: true,
              options: [
                {
                  label: "Defend",
                  value: "defend",
                },
                {
                  label: "Attack",
                  value: "attack",
                },
                {
                  label: "Claim",
                  value: "claim",
                },
              ],
            },
          ],
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

  const choosenTile = requestUrl.searchParams.get("paramTile");
  const choosenFirstAction = requestUrl.searchParams.get("paramFirstAction");
  const choosenMemecoin = requestUrl.searchParams.get("paramMemecoin");
  const amount = parseFloat(requestUrl.searchParams.get("paramAmount") || "0");

  const connection = new Connection(
    process.env.SOLANA_RPC! ||
      clusterApiUrl(envEnviroment === "production" ? "mainnet-beta" : "devnet")
  );

  const body: ActionPostRequest = await req.json();
  const account = new PublicKey(body.account);

  // Derive the game state account (you may need to adjust this based on your program's logic)
  const [gameState] = PublicKey.findProgramAddressSync(
    [Buffer.from("game_state")],
    PROGRAM_ID
  );

  console.log("gameState: ", gameState.toBase58());
  let transaction = new Transaction();

  transaction.feePayer = account;
  transaction.recentBlockhash = (
    await connection.getLatestBlockhash()
  ).blockhash;

  console.log("Set fee payer and recent blockhash");

  // Conditional payload based on the game result
  let payload: ActionPostResponse;

  if (choosenFirstAction === "last") {
    payload = await createPostResponse({
      fields: {
        transaction,
        message: `You chose ${choosenFirstAction}}`,
        links: {
          next: {
            action: {
              type: "completed",
              title: `Rock paper scissors #2`,
              icon: new URL("/win.png", new URL(req.url).origin).toString(),
              description: `You chose ${choosenFirstAction}}`,
              label: "Yayy",
            },
            type: "inline",
          },
        },
      },
    });
  } else if (choosenFirstAction === "attack") {

    // Call the enter_game instruction from the program
    const boxNumber = parseInt(choosenTile!) - 1; // Assuming tiles are 1-9
    const amountInLamports = Math.floor(amount * LAMPORTS_PER_SOL);

    const enterGameInstruction = createEnterGameInstruction(
      gameState,
      account,
      choosenMemecoin!,
      amountInLamports,
      boxNumber
    );

    transaction.add(enterGameInstruction);
    payload = await createPostResponse({
      fields: {
        transaction,
        message: "Action Successful, Next steps in the Linked Blink",
        links: {
          next: {
            action: {
              type: "action",
              title: `Let's Play! Choose your Attack`,
              icon: new URL("/api/og", new URL(req.url).origin).toString(),
              description: `\Select a memecoin and an amount`,
              label: "Confirm",
              links: {
                actions: [
                  {
                    label: "Attack",
                    href: `${baseHref}/game?paramAmount={paramAmount}&paramMemecoin={paramMemecoin}&paramTile={paramTile}&paramFirstAction=last`,
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
                      {
                        type: "select",
                        name: "paramMemecoin",
                        label: "Select an memecoin",
                        required: true,
                        options: [
                          {
                            label: "Dogwifihat",
                            value: "wif",
                          },
                          {
                            label: "Bonk",
                            value: "bonk",
                          },
                          {
                            label: "Popcat",
                            value: "popcat",
                          },
                          {
                            label: "Book of Meme",
                            value: "bome",
                          },
                          {
                            label: "Cats in a dogs world",
                            value: "mew",
                          },
                          {
                            label: "Gigachad",
                            value: "giga",
                          },
                          {
                            label: "Ponke",
                            value: "ponke",
                          },
                          {
                            label: "Mumu the bull",
                            value: "Mumu",
                          },
                          {
                            label: "Slerf",
                            value: "slerf",
                          },
                          {
                            label: "Fwog",
                            value: "fwog",
                          },
                          {
                            label: "Myro",
                            value: "myro",
                          },
                          {
                            label: "Wen",
                            value: "wen",
                          },
                        ],
                      },
                      {
                        type: "text",
                        name: "paramAmount",
                        label: "Enter the amount",
                        required: true,
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

    console.log("Post response payload:", payload);

    return Response.json(payload, {
      headers: ACTIONS_CORS_HEADERS,
    });
  } else if (choosenFirstAction === "defend") {
    payload = await createPostResponse({
      fields: {
        transaction,
        message: "Action Successful, Next steps in the Linked Blink",
        links: {
          next: {
            action: {
              type: "action",
              title: `Let's Play! Choose your Defense`,
              icon: new URL("/api/og", new URL(req.url).origin).toString(),
              description: `\Select a memecoin and an amount`,
              label: "Confirm",
              links: {
                actions: [
                  {
                    label: "Defend",
                    href: `${baseHref}/game?paramAmount={paramAmount}&paramMemecoin={paramMemecoin}&paramFirstAction={last}`,
                    parameters: [
                      {
                        type: "select",
                        name: "paramTile",
                        label: "Select a Tiles",
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
                      {
                        type: "select",
                        name: "paramMemecoin",
                        label: "Select an memecoin",
                        required: true,
                        options: [
                          {
                            label: "X",
                            value: "x",
                          },
                          {
                            label: "Y",
                            value: "y",
                          },
                          {
                            label: "Z",
                            value: "z",
                          },
                        ],
                      },
                      {
                        type: "text",
                        name: "paramAmount",
                        label: "Enter an amount",
                        required: true,
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

    console.log("Post response payload:", payload);

    return Response.json(payload, {
      headers: ACTIONS_CORS_HEADERS,
    });
  } else if (choosenFirstAction === "claim") {
    payload = await createPostResponse({
      fields: {
        transaction,
        message: "Action Successful, Next steps in the Linked Blink",
        links: {
          next: {
            action: {
              type: "action",
              title: `Let's Play! Choose your Defense`,
              icon: new URL("/api/og", new URL(req.url).origin).toString(),
              description: `\Select a memecoin and an amount`,
              label: "Confirm",
              links: {
                actions: [
                  {
                    label: "Claim",
                    href: `${baseHref}/game?paramAmount={paramAmount}&paramTile={paramTile}&paramFirstAction={last}`,
                    parameters: [
                      {
                        type: "select",
                        name: "paramTile",
                        label: "Select the Tile",
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
                      {
                        type: "text",
                        name: "paramAmount",
                        label: "Enter an amount",
                        required: true,
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

    console.log("Post response payload:", payload);

    return Response.json(payload, {
      headers: ACTIONS_CORS_HEADERS,
    });
  }
};
