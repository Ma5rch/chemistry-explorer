"use client";

import { Editor } from "ketcher-react";
import "ketcher-react/dist/index.css";
import { StandaloneStructServiceProvider } from "ketcher-standalone";
import type { Ketcher } from "ketcher-core";

const provider = new StandaloneStructServiceProvider();

export default function KetcherEditor({ onReady, onError }: {
  onReady: (k: Ketcher) => void;
  onError: (message: string) => void;
}) {
  return <Editor staticResourcesUrl="" structServiceProvider={provider}
    errorHandler={(message: string) => onError(String(message))}
    onInit={(k: Ketcher) => onReady(k)} />;
}
