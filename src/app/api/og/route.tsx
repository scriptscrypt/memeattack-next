import Image from "next/image";
import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Get game state from query params or database
    const gameState = {
      tokens: [
        { name: "WEN", amount: "1.5k", price: 87 },
        { name: "POPCAT", amount: "1.1M", price: 66 },
      ],
    };

    const fnRenderBox = (boxContents: any) => {
      return (
        <div
          style={{
            display: "flex",
            height: "299px",
            width: "299px",
            justifyContent: "center",
            alignItems: "center",
            border: "1px solid #000",
          }}
        >
          {boxContents}
        </div>
      );
    };

    return new ImageResponse(
      (
        <div
          style={{
            display: "flex",
            height: "900px",
            width: "900px",
            justifyContent: "center",
            alignItems: "center",
            flexWrap: "wrap",
            borderRadius: "8px",
            border: "1px solid gray",
          }}
        >
          {fnRenderBox(
            <>
              Occupied by WEN
              <Image alt="$WEN" src="/coins/wen.png" width={120} height={120} />{" "}
            </>
          )}
          {fnRenderBox(2)}
          {fnRenderBox(3)}
          {fnRenderBox(4)}
          {fnRenderBox("Occupy this box to Win 1 SOL")}
          {fnRenderBox(6)}
          {fnRenderBox(7)}
          {fnRenderBox(8)}
          {fnRenderBox(9)}
        </div>
      ),
      {
        width: 900,
        height: 900,
      }
    );
  } catch (e: any) {
    console.log(`${e.message}`);
    return new Response(`Failed to generate the image`, {
      status: 500,
    });
  }
}
