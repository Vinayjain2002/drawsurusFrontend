"use client"

import type React from "react"
import { useRef, useEffect, useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Eraser, RotateCcw, Palette, Download, Undo, Redo } from "lucide-react"
import type { GameData } from "@/app/page"

interface DrawingCanvasProps {
  canDraw: boolean
  onDrawingChange: (imageData: string) => void
  gameData: GameData
}

interface DrawingState {
  imageData: string
  timestamp: number
}

export default function DrawingCanvas({ canDraw, onDrawingChange, gameData }: DrawingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [currentColor, setCurrentColor] = useState("#000000")
  const [brushSize, setBrushSize] = useState(5)
  const [isEraser, setIsEraser] = useState(false)
  const [drawingHistory, setDrawingHistory] = useState<DrawingState[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)

  const colors = [
    "#000000",
    "#FFFFFF",
    "#FF0000",
    "#00FF00",
    "#0000FF",
    "#FFFF00",
    "#FF00FF",
    "#00FFFF",
    "#FFA500",
    "#800080",
    "#FFC0CB",
    "#A52A2A",
    "#808080",
    "#90EE90",
    "#FFB6C1",
    "#8B4513",
    "#FF69B4",
    "#32CD32",
    "#FF4500",
    "#9370DB",
    "#20B2AA",
    "#F0E68C",
    "#DDA0DD",
    "#98FB98",
  ]

  const brushSizes = [
    { size: 2, label: "Fine" },
    { size: 5, label: "Normal" },
    { size: 10, label: "Thick" },
    { size: 20, label: "Bold" },
  ]

  const initializeCanvas = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas size based on container
    const rect = canvas.getBoundingClientRect()
    const dpr = window.devicePixelRatio || 1

    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr

    ctx.scale(dpr, dpr)
    canvas.style.width = rect.width + "px"
    canvas.style.height = rect.height + "px"

    // Set initial canvas style
    ctx.lineCap = "round"
    ctx.lineJoin = "round"
    ctx.fillStyle = "white"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Save initial state
    saveToHistory()
  }, [])

  useEffect(() => {
    initializeCanvas()
  }, [initializeCanvas])

  // Clear canvas when new round starts
  useEffect(() => {
    if (canDraw) {
      clearCanvas()
    }
  }, [gameData.currentRound, gameData.currentDrawer])

  const saveToHistory = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const imageData = canvas.toDataURL()
    const newState: DrawingState = {
      imageData,
      timestamp: Date.now(),
    }

    setDrawingHistory((prev) => {
      const newHistory = prev.slice(0, historyIndex + 1)
      newHistory.push(newState)
      return newHistory.slice(-20) // Keep last 20 states
    })
    setHistoryIndex((prev) => Math.min(prev + 1, 19))
  }, [historyIndex])

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const canvas = canvasRef.current
      if (!canvas) return

      const ctx = canvas.getContext("2d")
      if (!ctx) return

      const prevState = drawingHistory[historyIndex - 1]
      const img = new Image()
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        ctx.drawImage(img, 0, 0)
        onDrawingChange(canvas.toDataURL())
      }
      img.src = prevState.imageData
      setHistoryIndex((prev) => prev - 1)
    }
  }, [historyIndex, drawingHistory, onDrawingChange])

  const redo = useCallback(() => {
    if (historyIndex < drawingHistory.length - 1) {
      const canvas = canvasRef.current
      if (!canvas) return

      const ctx = canvas.getContext("2d")
      if (!ctx) return

      const nextState = drawingHistory[historyIndex + 1]
      const img = new Image()
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        ctx.drawImage(img, 0, 0)
        onDrawingChange(canvas.toDataURL())
      }
      img.src = nextState.imageData
      setHistoryIndex((prev) => prev + 1)
    }
  }, [historyIndex, drawingHistory, onDrawingChange])

  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }

    const rect = canvas.getBoundingClientRect()
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY

    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    }
  }

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!canDraw) return

    setIsDrawing(true)
    const canvas = canvasRef.current
    if (!canvas) return

    const { x, y } = getCoordinates(e)
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.beginPath()
    ctx.moveTo(x, y)
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !canDraw) return

    const canvas = canvasRef.current
    if (!canvas) return

    const { x, y } = getCoordinates(e)
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.lineWidth = brushSize
    ctx.globalCompositeOperation = isEraser ? "destination-out" : "source-over"
    ctx.strokeStyle = isEraser ? "rgba(0,0,0,1)" : currentColor
    ctx.lineTo(x, y)
    ctx.stroke()
  }

  const stopDrawing = () => {
    if (!isDrawing) return

    setIsDrawing(false)
    const canvas = canvasRef.current
    if (canvas) {
      onDrawingChange(canvas.toDataURL())
      saveToHistory()
    }
  }

  const clearCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.fillStyle = "white"
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    onDrawingChange(canvas.toDataURL())
    saveToHistory()
  }

  const downloadDrawing = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const link = document.createElement("a")
    link.download = `drawsurus-${gameData.currentRound}-${Date.now()}.png`
    link.href = canvas.toDataURL()
    link.click()
  }

  return (
    <div className="space-y-4">
      {/* Enhanced Drawing Tools */}
      {canDraw && (
        <Card className="bg-gray-50">
          <CardContent className="p-4">
            <div className="space-y-4">
              {/* Color Palette */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Palette className="w-4 h-4" />
                  <h4 className="text-sm font-semibold">Colors</h4>
                  <Badge variant="outline" className="text-xs">
                    {isEraser ? "Eraser" : "Brush"}
                  </Badge>
                </div>
                <div className="grid grid-cols-8 gap-2">
                  {colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => {
                        setCurrentColor(color)
                        setIsEraser(false)
                      }}
                      className={`w-8 h-8 rounded-full border-2 transition-all hover:scale-110 ${
                        currentColor === color && !isEraser
                          ? "border-gray-800 shadow-lg scale-110"
                          : "border-gray-300 hover:border-gray-500"
                      }`}
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </div>

              {/* Brush Size */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-semibold">Brush Size</h4>
                  <Badge variant="outline">{brushSize}px</Badge>
                </div>
                <div className="flex items-center gap-3">
                  {brushSizes.map((brush) => (
                    <Button
                      key={brush.size}
                      size="sm"
                      variant={brushSize === brush.size ? "default" : "outline"}
                      onClick={() => setBrushSize(brush.size)}
                      className="flex flex-col gap-1 h-auto py-2"
                    >
                      <div
                        className="rounded-full bg-current"
                        style={{
                          width: Math.min(brush.size, 12),
                          height: Math.min(brush.size, 12),
                        }}
                      />
                      <span className="text-xs">{brush.label}</span>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Tools */}
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant={isEraser ? "default" : "outline"}
                  onClick={() => setIsEraser(!isEraser)}
                  className="gap-1"
                >
                  <Eraser className="w-4 h-4" />
                  Eraser
                </Button>
                <Button size="sm" variant="outline" onClick={clearCanvas} className="gap-1 bg-transparent">
                  <RotateCcw className="w-4 h-4" />
                  Clear
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={undo}
                  disabled={historyIndex <= 0}
                  className="gap-1 bg-transparent"
                >
                  <Undo className="w-4 h-4" />
                  Undo
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={redo}
                  disabled={historyIndex >= drawingHistory.length - 1}
                  className="gap-1"
                >
                  <Redo className="w-4 h-4" />
                  Redo
                </Button>
                <Button size="sm" variant="outline" onClick={downloadDrawing} className="gap-1 bg-transparent">
                  <Download className="w-4 h-4" />
                  Save
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Enhanced Canvas */}
      <div className="relative">
        <canvas
          ref={canvasRef}
          className={`w-full h-[500px] border-2 rounded-xl bg-white shadow-inner ${
            canDraw
              ? "cursor-crosshair border-purple-300 hover:border-purple-400"
              : "cursor-not-allowed border-gray-300"
          }`}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={(e) => {
            e.preventDefault()
            startDrawing(e)
          }}
          onTouchMove={(e) => {
            e.preventDefault()
            draw(e)
          }}
          onTouchEnd={(e) => {
            e.preventDefault()
            stopDrawing()
          }}
        />

        {!canDraw && (
          <div className="absolute inset-0 bg-black/5 rounded-xl flex items-center justify-center backdrop-blur-sm">
            <div className="text-center">
              <div className="text-4xl mb-2">👀</div>
              <p className="text-gray-600 font-medium">Watch and guess!</p>
              <p className="text-sm text-gray-500">The artist is creating something amazing</p>
            </div>
          </div>
        )}

        {/* Drawing indicator */}
        {canDraw && isDrawing && (
          <div className="absolute top-2 right-2">
            <Badge className="bg-green-500 animate-pulse">Drawing...</Badge>
          </div>
        )}
      </div>
    </div>
  )
}
