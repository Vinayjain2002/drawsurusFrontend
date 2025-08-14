"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Upload, XCircle } from "lucide-react"

interface KeywordUploadProps {
  customWords: string[]
  onUpdateWords: (words: string[]) => void
}

export default function KeywordUpload({ customWords, onUpdateWords }: KeywordUploadProps) {
  console.log("On  Key Word Screen", customWords);
  const [newWord, setNewWord] = useState("")
  const [uploadText, setUploadText] = useState("")

  const handleAddWord = () => {
    if (newWord.trim()) {
      console.log("the new Custom Word added is defined as the", newWord);
      onUpdateWords([...customWords, newWord.trim().toUpperCase()])
      setNewWord("")
    }
  }

  const handleRemoveWord = useCallback(
    (wordToRemove: string) => {
      onUpdateWords(customWords.filter((word) => word !== wordToRemove))
    },
    [customWords, onUpdateWords],
  )

  const handleUpload = () => {
    const words = uploadText
      .split(/[\n,]+/) // Split by newlines and commas
      .map((word) => word.trim().toUpperCase())
      .filter(Boolean) // Remove empty strings

    onUpdateWords([...customWords, ...words])
    setUploadText("")
  }

  return (
    <Card className="bg-white/95 backdrop-blur-sm shadow-xl border-0">
      <CardHeader>
        <CardTitle>Custom Keywords</CardTitle>
        <p className="text-gray-600">Add your own words for more personalized fun!</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add Single Word */}
        <div className="space-y-2">
          <h4 className="text-sm font-semibold">Add Word Manually</h4>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Enter a new word"
              value={newWord}
              onChange={(e) => setNewWord(e.target.value)}
              className="flex-1 px-3 py-2 border rounded-md focus:ring-purple-400 focus:border-purple-400"
            />
            <Button onClick={handleAddWord} className="bg-purple-500 hover:bg-purple-600 text-white">
              Add
            </Button>
          </div>
        </div>

        {/* Upload Multiple Words */}
        <div className="space-y-2">
          <h4 className="text-sm font-semibold">Upload Word List</h4>
          <Textarea
            placeholder="Enter words separated by commas or newlines"
            value={uploadText}
            onChange={(e) => setUploadText(e.target.value)}
            className="h-24 border rounded-md focus:ring-purple-400 focus:border-purple-400"
          />
          <Button onClick={handleUpload} className="bg-blue-500 hover:bg-blue-600 text-white">
            <Upload className="w-4 h-4 mr-2" />
            Upload
          </Button>
        </div>

        {/* Current Keywords */}
        <div>
          <h4 className="text-sm font-semibold">Current Keywords</h4>
          {customWords.length === 0 ? (
            <p className="text-gray-500">No custom keywords added yet.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {customWords.map((word) => (
                <Badge key={word} className="gap-1.5">
                  {word}
                  <Button variant="ghost" size="sm" onClick={() => handleRemoveWord(word)}>
                    <XCircle className="h-4 w-4" />
                  </Button>
                </Badge>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
