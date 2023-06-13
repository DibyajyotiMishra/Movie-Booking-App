/**
 * For testing purposes only
 */

import { Request, Response } from "express";

export default function parseResponse(req: Request, res: Response) {
  try {
    return res.status(201).json({ data: JSON.parse(req.body) });
  } catch (error) {
    return res.status(500);
  }
}
