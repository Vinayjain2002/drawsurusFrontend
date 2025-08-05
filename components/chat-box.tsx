"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Send, MessageCircle, Smile } from "lucide-react"
import type { Player } from "@/app/page"

interface ChatMessage {
  id: string
  player: string
  message: string
  type: "guess" | "correct" | "system" | "hint"
  timestamp: number
  avatar?: string
}

interface ChatBoxProps {
  messages: ChatMessage[]
  onSendMessage: (message: string) => void
  disabled?: boolean
  placeholder?: string
  currentPlayer: Player
}

const QUICK_REACTIONS = ["👍", "😂", "😮", "🤔", "❤️", "🎉"]

export default function ChatBox({
  messages,
  onSendMessage,
  disabled = false,
  placeholder = "Type your guess...",
  currentPlayer,
}: ChatBoxProps) {
  const [inputValue, setInputValue] = useState("")
  const [lastMessageTime, setLastMessageTime] = useState(0)
  const [showReactions, setShowReactions] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Auto-focus input when not disabled
  useEffect(() => {
    if (!disabled && inputRef.current) {
      inputRef.current.focus()
    }
  }, [disabled])

  const handleSend = () => {
    const now = Date.now()
    // Enhanced anti-spam: prevent sending messages too quickly
    if (now - lastMessageTime < 500) return

    if (inputValue.trim() && !disabled) {
      onSendMessage(inputValue.trim())
      setInputValue("")
      setLastMessageTime(now)
    }
  }

  const handleReaction = (reaction: string) => {
    onSendMessage(reaction)
    setShowReactions(false)
    setLastMessageTime(Date.now())
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const getMessageStyle = (type: ChatMessage["type"]) => {
    switch (type) {
      case "correct":
        return "bg-gradient-to-r from-green-100 to-emerald-100 border-green-300 text-green-800"
      case "system":
        return "bg-gradient-to-r from-blue-100 to-indigo-100 border-blue-300 text-blue-800"
      case "hint":
        return "bg-gradient-to-r from-yellow-100 to-amber-100 border-yellow-300 text-yellow-800"
      default:
        return "bg-white border-gray-200 text-gray-800 hover:bg-gray-50"
    }
  }

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getMessageIcon = (type: ChatMessage["type"]) => {
    switch (type) {
      case "correct":
        return "🎉"
      case "system":
        return "🤖"
      case "hint":
        return "💡"
      default:
        return null
    }
  }

  return (
    <Card className="bg-white/95 backdrop-blur-sm shadow-xl border-0 h-80 flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            <span>Chat</span>
            <Badge variant="outline" className="text-xs">
              {messages.length}
            </Badge>
          </div>
          {!disabled && (
            <Button size="sm" variant="ghost" onClick={() => setShowReactions(!showReactions)} className="p-1">
              <Smile className="w-4 h-4" />
            </Button>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-4 pt-0">
        {/* Quick Reactions */}
        {showReactions && !disabled && (
          <div className="flex gap-1 mb-3 p-2 bg-gray-50 rounded-lg">
            {QUICK_REACTIONS.map((reaction) => (
              <Button
                key={reaction}
                size="sm"
                variant="ghost"
                onClick={() => handleReaction(reaction)}
                className="text-lg p-1 h-8 w-8"
              >
                {reaction}
              </Button>
            ))}
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-2 mb-4 pr-2 max-h-48">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="font-medium">No messages yet</p>
              <p className="text-sm">Start guessing to join the conversation!</p>
            </div>
          ) : (
            messages.map((message) => (
              <div key={message.id} className={`p-3 rounded-lg border transition-all ${getMessageStyle(message.type)}`}>
                <div className="flex justify-between items-start gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {message.avatar && <span className="text-sm">{message.avatar}</span>}
                      {getMessageIcon(message.type) && <span className="text-sm">{getMessageIcon(message.type)}</span>}
                      <span className="font-semibold text-sm">{message.player}</span>
                      <span className="text-xs opacity-60">{formatTime(message.timestamp)}</span>
                    </div>
                    <p className="text-sm leading-relaxed">{message.message}</p>
                  </div>
                  {message.type === "correct" && <div className="text-green-600 font-bold text-lg">✓</div>}
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="space-y-2">
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={placeholder}
              disabled={disabled}
              className="flex-1"
              maxLength={100}
            />
            <Button onClick={handleSend} disabled={disabled || !inputValue.trim()} size="sm" className="px-3">
              <Send className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex justify-between text-xs text-gray-500">
            <span>{disabled ? "You can't chat while drawing" : `${inputValue.length}/100 characters`}</span>
            {!disabled && <span>Press Enter to send</span>}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
