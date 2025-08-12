"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Lightbulb, Target, Zap } from "lucide-react"

interface WordGuessingProps{
    currentWord: string
    wordHint: string
    onGuess: (guess: string)=> void
    disabled?: boolean
    showHint?: boolean
    onShowHint?: ()=> void
}


export default function WordGuessing({
  currentWord,
  wordHint,
  onGuess,
  disabled = false,
  showHint = false,
  onShowHint
}: WordGuessingProps){
  const [guess, setGuess]= useState("");

  // Need to define the Quick guesses array route and need to set that one also
  const [quickGuesses, setQuickGuesses] = useState([
    "CAT",
    "DOG",
    "HOUSE",
    "CAR",
    "TREE",
    "FLOWER",
    "BIRD",
    "FISH",
    "SUN",
    "MOON",
    "STAR",
    "HEART"
  ]);

  const handleSubmitGuess=()=>{
      if(guess.trim()){
        onGuess(guess.trim());
        setGuess("");
      }
  }

  const handleQuickGuess= (word: string)=>{
    onGuess(word);
  }

  const getHintProgress = () => {
    const visibleLetters = wordHint.split(" ").filter((char) => char !== "_").length
    const totalLetters = currentWord.length
    return (visibleLetters / totalLetters) * 100
  }

  return (
     <Card className="bg-white/95 backdrop-blur-sm shadow-xl border-0">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-500" />
            <span>Make Your Guess</span>
          </div>
          {onShowHint && !showHint && (
            <Button size="sm" variant="outline" onClick={onShowHint} className="gap-1 bg-transparent">
              <Lightbulb className="w-4 h-4" />
              Hint
            </Button>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Word Hint Display */}
        {showHint && (
          <div className="text-center p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Lightbulb className="w-5 h-5 text-blue-500" />
              <Badge className="bg-blue-500">Hint Revealed</Badge>
            </div>
            <div className="text-2xl font-mono font-bold text-blue-700 mb-2">{wordHint}</div>
            <div className="text-sm text-blue-600">{Math.round(getHintProgress())}% of letters revealed</div>
          </div>
        )}

        {/* Manual Guess Input */}
        <div className="space-y-2">
          <h4 className="text-sm font-semibold flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Type Your Guess
          </h4>
          <div className="flex gap-2">
            <Input
              placeholder="What do you think it is?"
              value={guess}
              onChange={(e) => setGuess(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSubmitGuess()}
              disabled={disabled}
              className="flex-1 text-lg"
              maxLength={25}
            />
            <Button
              onClick={handleSubmitGuess}
              disabled={disabled || !guess.trim()}
              className="bg-green-500 hover:bg-green-600"
            >
              Guess!
            </Button>
          </div>
        </div>

        {/* Quick Guess Options */}
        <div className="space-y-2">
          <h4 className="text-sm font-semibold">Quick Guesses</h4>
          <div className="grid grid-cols-3 gap-2">
            {quickGuesses.slice(0, 12).map((word) => (
              <Button
                key={word}
                size="sm"
                variant="outline"
                onClick={() => handleQuickGuess(word)}
                disabled={disabled}
                className="text-xs p-2 h-8"
              >
                {word}
              </Button>
            ))}
          </div>
        </div>

        {/* Guessing Tips */}
        <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
          <p className="font-semibold mb-1">💡 Guessing Tips:</p>
          <ul className="space-y-1">
            <li>• Look at the drawing carefully</li>
            <li>• Use the hint if you're stuck</li>
            <li>• Think about the category</li>
            <li>• Try common words first</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}