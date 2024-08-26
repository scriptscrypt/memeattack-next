import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import wenLogo from "../../../assets/wen.png";
export const runtime = "edge";

export async function GET(request: NextRequest) {
  try {
    const { origin } = new URL(request.url);
    const absoluteWenLogoUrl = `${origin}${wenLogo.src}`;

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
              <div style={{ display: "flex", flexDirection: "column" }}>
                <img
                  alt="$WEN"
                  src={absoluteWenLogoUrl}
                  width={200}
                  height={200}
                />

                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <div style={{ display: "flex" }}>
                    <div style={{ display: "flex" }}>1.5k </div>
                    <div style={{ display: "flex" }}>WEN </div>
                  </div>

                  <div style={{ display: "flex" }}> $250</div>
                </div>
              </div>
            </>
          )}
          {fnRenderBox(2)}
          {fnRenderBox(3)}
          {fnRenderBox(4)}
          {fnRenderBox("Occupy this box to Win 1 SOL")}
          {fnRenderBox(6)}
          {fnRenderBox(7)}
          {fnRenderBox(
            <img alt="$WEN" src={absoluteWenLogoUrl} width={240} height={240} />
          )}
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
