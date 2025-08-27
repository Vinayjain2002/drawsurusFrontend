"use client"

import { useState, useCallback } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Upload, XCircle } from "lucide-react"
import { Difficulty, WordRootState, Word } from "@/utils/types/game"
import { removeCustomWord } from "@/store/slices/wordSlice"

export default function KeywordUpload() {
  const dispatch = useDispatch()
  const customWords = useSelector((state: WordRootState) => state.word.customWords)
  const [newWord, setNewWord] = useState("")
  const [difficulty, setDifficulty] = useState<Difficulty>("medium")
  const [roomID, setRoomID] = useState("")
  const [uploadText, setUploadText] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleAddWord = async () => {
    if (!newWord.trim() || !roomID.trim()) {
      setError("Please enter a word and a room ID")
      return
    }

    const wordObj: Word = {
      word: newWord.trim().toUpperCase(),
      difficulty,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      // roomID,
    }

    setIsLoading(true)
    try {
      dispatch(addCustomWord(wordObj.word))
      setNewWord("")
      setError(null)
    } catch (err) {
      setError("Failed to add word: " + (err as Error).message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRemoveWord = useCallback(
    async (wordToRemove: string) => {
      setIsLoading(true)
      try {
        dispatch(removeCustomWord(wordToRemove))
        setError(null)
      } catch (err) {
        setError("Failed to remove word: " + (err as Error).message)
      } finally {
        setIsLoading(false)
      }
    },
    [dispatch]
  )

  const handleUpload = async () => {
    if (!roomID.trim()) {
      setError("Please enter a room ID")
      return
    }

    const words = uploadText
      .split(/[\n,]+/)
      .map((word) => word.trim().toUpperCase())
      .filter(Boolean)
      .map((word) => ({
        word,
        difficulty,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        roomID,
      }))

    if (words.length === 0) {
      setError("No valid words to upload")
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch("/api/insertWords", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(words),
      })
      if (!response.ok) throw new Error("Failed to upload words")
      dispatch(setCustomWords([...customWords, ...words]))
      setUploadText("")
      setError(null)
    } catch (err) {
      setError("Failed to upload words: " + (err as Error).message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="bg-white/95 backdrop-blur-sm shadow-xl border-0">
      <CardHeader>
        <CardTitle>Custom Keywords</CardTitle>
        <p className="text-gray-600">Add your own words for more personalized fun!</p>
        {error && <p className="text-red-500">{error}</p>}
        {isLoading && <p className="text-gray-500">Loading...</p>}
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Room ID Input */}
        <div className="space-y-2">
          <h4 className="text-sm font-semibold">Room ID</h4>
          <input
            type="text"
            placeholder="Enter Room ID"
            value={roomID}
            onChange={(e) => setRoomID(e.target.value)}
            className="w-full px-3 py-2 border rounded-md focus:ring-purple-400 focus:border-purple-400"
            disabled={isLoading}
          />
        </div>

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
              disabled={isLoading}
            />
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as Difficulty)}
              className="px-3 py-2 border rounded-md focus:ring-purple-400 focus:border-purple-400"
              disabled={isLoading}
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
            <Button
              onClick={handleAddWord}
              className="bg-purple-500 hover:bg-purple-600 text-white"
              disabled={isLoading}
            >
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
            disabled={isLoading}
          />
          <div className="flex gap-2">
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as Difficulty)}
              className="px-3 py-2 border rounded-md focus:ring-purple-400 focus:border-purple-400"
              disabled={isLoading}
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
            <Button
              onClick={handleUpload}
              className="bg-blue-500 hover:bg-blue-600 text-white"
              disabled={isLoading}
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload
            </Button>
          </div>
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