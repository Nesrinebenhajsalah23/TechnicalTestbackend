// src/controllers/product.controller.ts
import { Request, Response } from "express";
import prisma from "../prismaClient"; // ← ici, c'est bien le fichier que tu as créé

export const getAllProducts = async (req: Request, res: Response) => {
  const { category } = req.query;
  const products = category
    ? await prisma.product.findMany({ where: { category: String(category) } })
    : await prisma.product.findMany();
  res.json(products);
};

export const getProductById = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) return res.status(404).json({ message: "Product not found" });
  res.json(product);
};

export const createProduct = async (req: Request, res: Response) => {
  const { name, category, price, image, inStock, variants } = req.body;
  if (!name || !category || price === undefined)
    return res.status(400).json({ message: "Missing required fields" });

  const product = await prisma.product.create({
    data: {
      name,
      category,
      price: parseFloat(price),
      ...(image && { image }),
      inStock: inStock !== undefined ? Boolean(inStock) : true,
      variants: variants ? JSON.stringify(variants) : "",
    },
  });
  res.status(201).json(product);
};


export const getProductsByCategory = async (req: Request, res: Response) => {
  const category = (req.query.category as string | undefined)?.toLowerCase();

  try {
    let products = await prisma.product.findMany();

    if (category) {
      products = products.filter(
        (p) => p.category.toLowerCase() === category
      );
    }

    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};


