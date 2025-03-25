"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ImageUploadForm } from "@/components/add-food/image-upload-form"
import { BarcodeScanner } from "@/components/add-food/barcode-scanner"
import { ManualEntryForm } from "@/components/add-food/manual-entry-form"

export function AddFoodTabs() {
  const [activeTab, setActiveTab] = useState("image")

  return (
    <Tabs defaultValue="image" value={activeTab} onValueChange={setActiveTab} className="w-full max-w-3xl mx-auto">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="image">Image Recognition</TabsTrigger>
        <TabsTrigger value="barcode">Barcode Scanner</TabsTrigger>
        <TabsTrigger value="manual">Manual Entry</TabsTrigger>
      </TabsList>
      <TabsContent value="image">
        <ImageUploadForm />
      </TabsContent>
      <TabsContent value="barcode">
        <BarcodeScanner />
      </TabsContent>
      <TabsContent value="manual">
        <ManualEntryForm />
      </TabsContent>
    </Tabs>
  )
}

