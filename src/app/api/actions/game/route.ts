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

  // Get the 'paramTile' parameter from the URL
  const choosenTile = requestUrl.searchParams.get("paramTile");
  const choosenFirstAction = requestUrl.searchParams.get("paramFirstAction");

  // if (!choosenTile) {
  //   return NextResponse?.json(
  //     {
  //       message: "Invalid choice. Please select tiles from 1 to 9.",
  //     },
  //     {
  //       headers: ACTIONS_CORS_HEADERS,
  //       status: 400,
  //     }
  //   );
  // }
  // if (!choosenFirstAction) {
  //   return NextResponse?.json(
  //     {
  //       message: "Invalid choice. Please select an action.",
  //     },
  //     {
  //       headers: ACTIONS_CORS_HEADERS,
  //       status: 400,
  //     }
  //   );
  // }

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
                    href: `${baseHref}/game?paramAmount={paramAmount}&paramMemecoin={paramMemecoin}`,
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
