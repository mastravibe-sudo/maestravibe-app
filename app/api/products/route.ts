
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";
// GET /api/products — fetch all products sorted newest first
export async function GET() {
  try {
    await connectDB();

    const products = await Product.find({}).sort({ createdAt: -1 }).lean();

    return NextResponse.json(products, { status: 200 });
  } catch (error: any) {
    console.error("GET /api/products error:", error);
    return NextResponse.json(
      { message: "Failed to fetch products", error: error.message },
      { status: 500 }
    );
  }
}

// POST /api/products — create a new product
export async function POST(req: Request) {
  try {
    await connectDB();

    const body = await req.json();

    // Validate required fields
    if (!body.name || body.name.trim() === "") {
      return NextResponse.json(
        { message: "Product name is required" },
        { status: 400 }
      );
    }

    if (!body.price || isNaN(Number(body.price))) {
      return NextResponse.json(
        { message: "Valid price is required" },
        { status: 400 }
      );
    }

    if (!body.images || body.images.length === 0) {
      return NextResponse.json(
        { message: "At least one image is required" },
        { status: 400 }
      );
    }

    const productData = {
      name: body.name.trim(),
      price: Number(body.price),
      category: body.category || "fashion",
      description: body.description || "",
      colors: body.colors || [],
      sizes: body.sizes || [],
      images: body.images || [],
    };

    const product = await Product.create(productData);

    return NextResponse.json(product, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/products error:", error);

    if (error.name === "ValidationError") {
      return NextResponse.json(
        { message: "Validation failed", error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: "Failed to create product", error: error.message },
      { status: 500 }
    );
  }
}