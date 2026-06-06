import { NextRequest, NextResponse } from "next/server";
import { isCodeValid, deleteVerificationCode } from "@/lib/verification-store";

export async function POST(request: NextRequest) {
  try {
    const { email, code } = await request.json();

    if (!email || !code) {
      return NextResponse.json(
        { error: "Email and code are required" },
        { status: 400 }
      );
    }

    if (code.length !== 6) {
      return NextResponse.json(
        { error: "Verification code must be 6 digits" },
        { status: 400 }
      );
    }

    if (!isCodeValid(email, code)) {
      return NextResponse.json(
        { error: "Invalid or expired verification code" },
        { status: 400 }
      );
    }

    // Code is valid - remove it to prevent reuse
    deleteVerificationCode(email);

    return NextResponse.json({ 
      success: true, 
      message: "Email verified successfully" 
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
