import {
    PublicKey,
    SystemProgram,
    TransactionInstruction
} from "@solana/web3.js";
import { TextEncoder } from "util";
export const PROGRAM_ID = new PublicKey(
  "9FbdAZZyKzgZd4ncjpytMpvkR64u6QF7uvL9prLq6Cnx"
);

export function createEnterGameInstruction(
  gameState: PublicKey,
  player: PublicKey,
  memeCoiName: string,
  amountInLamports: number,
  boxNumber: number
): TransactionInstruction {
  return new TransactionInstruction({
    keys: [
      { pubkey: gameState, isSigner: false, isWritable: true },
      { pubkey: player, isSigner: true, isWritable: true },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ],
    programId: PROGRAM_ID,
    data: Buffer.from(
      Uint8Array.of(
        0, // Instruction index for enter_game
        ...new TextEncoder().encode(memeCoiName),
        ...new Uint8Array(
          new BigUint64Array([BigInt(amountInLamports)]).buffer
        ),
        boxNumber
      )
    ),
  });
}

export function createClaimPrizeInstruction(
  gameState: PublicKey,
  player: PublicKey,
  boxNumber: number,
  memeCoiName: string
): TransactionInstruction {
  return new TransactionInstruction({
    keys: [
      { pubkey: gameState, isSigner: false, isWritable: true },
      { pubkey: player, isSigner: true, isWritable: true },
    ],
    programId: PROGRAM_ID,
    data: Buffer.from(
      Uint8Array.of(
        1, // Instruction index for claim_prize
        boxNumber,
        ...new TextEncoder().encode(memeCoiName)
      )
    ),
  });
}
