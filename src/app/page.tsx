import Image from "next/image";

export default function Home() {
  return (
    <>
      <div className="flex flex-col items-center">
        <div className="flex justify-center items-center align-middle h-screen">
          GM! This is a Solana Blink. Try it
          <a href="https://dial.to/developer?url=https://rockpaperblinks.vercel.app/rps&cluster=devnet">
            <span className="text-blue-500 cursor-pointer mx-2">here</span>
          </a>
          [Currently on DEVNET]
        </div>

        <Image
          src="/api/og"
          width={900}
          height={900}
          alt="Dynamic Game Board"
        />
      </div>
    </>
  );
}
