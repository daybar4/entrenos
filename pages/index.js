import Head from "next/head";
import Image from "next/image";
import { Geist, Geist_Mono } from "next/font/google";
import styles from "@/styles/Home.module.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function Home() {
  return (
    <div style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "100vh",
      textAlign: "center",
      flexDirection: "column"
    }}>
      <h1 style={{ fontSize: "2.5rem", fontWeight: "bold" }}>🌟 ¡Bienvenid@! 🌟</h1>
      <p style={{ fontSize: "1.2rem", maxWidth: "80%" }}>
        Esta es la página de inicio delos registros de entrenos.
      </p>
    </div>
  );
}
