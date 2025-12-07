import express from "express";
import cors from "cors";
import productRoutes from "./routes/product.routes";

const app = express();
app.use(cors());
app.use(express.json());
// Dans server.ts
app.use(express.static("public"));
app.use("/products", productRoutes);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
