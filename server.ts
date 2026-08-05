import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { z } from "zod";

const app = express();
const PORT = 3000;

app.use(express.json());

// In-memory database
type ClaimStatus = "Unclaimed" | "Pending Verification" | "Approved" | "Payment Processing" | "Paid" | "Rejected";
type PaymentMethod = "JazzCash" | "Easypaisa" | "Bank Transfer";

interface PaymentClaim {
  id: string;
  amount: number;
  reason: string;
  status: ClaimStatus;
  createdAt: string;
  fullName?: string;
  mobileNumber?: string;
  paymentMethod?: PaymentMethod;
  location?: { lat: number; lng: number };
  transactionReference?: string;
  updatedAt?: string;
}

const claims: PaymentClaim[] = [
  // Seed with Pay7 claim for testing
  {
    id: "Pay7",
    amount: 25000,
    reason: "Pay7 Reward Verification",
    status: "Unclaimed",
    createdAt: new Date().toISOString(),
  },
  {
    id: "PK-100294",
    amount: 5000,
    reason: "Freelance Service Payment - Web Design",
    status: "Unclaimed",
    createdAt: new Date().toISOString(),
  }
];

// --- API ROUTES ---

// Get all claims (Admin)
app.get("/api/admin/claims", (req, res) => {
  res.json({ claims });
});

// Create a new claim (Admin)
const createClaimSchema = z.object({
  amount: z.number().positive(),
  reason: z.string().min(3),
});

app.post("/api/admin/claims", (req, res) => {
  try {
    const data = createClaimSchema.parse(req.body);
    const newClaim: PaymentClaim = {
      id: `PK-${Math.floor(100000 + Math.random() * 900000)}`,
      amount: data.amount,
      reason: data.reason,
      status: "Unclaimed",
      createdAt: new Date().toISOString(),
    };
    claims.push(newClaim);
    res.status(201).json({ claim: newClaim });
  } catch (err) {
    res.status(400).json({ error: "Invalid data" });
  }
});

// Update claim status (Admin)
const updateClaimStatusSchema = z.object({
  status: z.enum(["Unclaimed", "Pending Verification", "Approved", "Payment Processing", "Paid", "Rejected"]),
});

app.patch("/api/admin/claims/:id", (req, res) => {
  try {
    const { status } = updateClaimStatusSchema.parse(req.body);
    const claim = claims.find(c => c.id === req.params.id);
    if (!claim) {
      return res.status(404).json({ error: "Claim not found" });
    }
    
    claim.status = status;
    claim.updatedAt = new Date().toISOString();
    
    if (status === "Paid" && !claim.transactionReference) {
      claim.transactionReference = `TXN-${Math.floor(10000000 + Math.random() * 90000000)}`;
    }
    
    res.json({ claim });
  } catch (err) {
    res.status(400).json({ error: "Invalid data" });
  }
});

// Get claim by ID (User)
app.get("/api/claims/:id", (req, res) => {
  const claim = claims.find(c => c.id === req.params.id);
  if (!claim) {
    return res.status(404).json({ error: "Claim not found or invalid ID." });
  }
  res.json({ claim });
});

// Submit a claim (User)
const submitClaimSchema = z.object({
  fullName: z.string().min(2),
  mobileNumber: z.string().regex(/^03\d{9}$/, "Must be a valid 11-digit Pakistani mobile number starting with 03"),
  paymentMethod: z.enum(["JazzCash", "Easypaisa", "Bank Transfer"]),
  location: z.object({
    lat: z.number(),
    lng: z.number(),
  }).optional(),
});

app.post("/api/claims/:id/submit", (req, res) => {
  try {
    const claim = claims.find(c => c.id === req.params.id);
    if (!claim) {
      return res.status(404).json({ error: "Claim not found." });
    }
    
    if (claim.status !== "Unclaimed") {
      return res.status(400).json({ error: "This claim has already been submitted or processed." });
    }

    const data = submitClaimSchema.parse(req.body);
    
    claim.fullName = data.fullName;
    claim.mobileNumber = data.mobileNumber;
    claim.paymentMethod = data.paymentMethod;
    if (data.location) {
      claim.location = data.location;
    }
    claim.status = "Pending Verification";
    claim.updatedAt = new Date().toISOString();
    
    res.json({ claim });
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: (err as any).errors[0].message });
    }
    res.status(400).json({ error: "Invalid data." });
  }
});

// --- VITE MIDDLEWARE ---
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
