# @rbxts/tutorial-ui-highlight

A React-based tutorial UI highlighting system for Roblox TypeScript projects. Create interactive tutorials with customizable overlay highlighting and step-by-step guidance.

## Features

- 🎯 **Precise UI Element Highlighting** - Automatically highlights specific UI elements with dark overlay around them
- ⚛️ **React Integration** - Built specifically for React-based Roblox TypeScript projects
- 🎨 **Customizable Styling** - Configure background colors, transparency, and interaction behavior
- 📱 **Responsive** - Automatically adapts to different screen sizes and camera changes
- 🔄 **Step Management** - Easy step-by-step tutorial progression with automatic cleanup
- 🎮 **Interactive Controls** - Optional click-through prevention for guided experiences

## Installation

```bash
npm install @rbxts/tutorial-ui-highlight
```

### Peer Dependencies

Make sure you have the required peer dependencies installed:

```bash
npm install @rbxts/charm @rbxts/react-charm @rbxts/react @rbxts/react-roblox
```

## Quick Start

### 1. Set up the Highlight Component

Add the `HighlightGui` component to your main UI:

```tsx
import React from "@rbxts/react";
import { HighlightGui } from "@rbxts/tutorial-ui-highlight";

export function App() {
	return (
		<>
			{/* Your existing UI */}
			<YourMainUI />

			{/* Add the highlight overlay */}
			<HighlightGui />
		</>
	);
}
```

### 2. Register UI Elements

Use the `useReportUiRectRef` hook to register elements you want to highlight:

```tsx
import { TutorialUiHightlight } from "@rbxts/tutorial-ui-highlight";

function MyButton() {
	const buttonRef = TutorialUiHightlight.useReportUiRectRef("my-button");

	return (
		<textbutton
			ref={buttonRef}
			Text="Click me!"
			Size={UDim2.fromOffset(200, 50)}
			// ... other props
		/>
	);
}
```

### 3. Start a Tutorial

```tsx
import { TutorialUiHightlight } from "@rbxts/tutorial-ui-highlight";

// Start a tutorial sequence
TutorialUiHightlight.SetTutorial(["my-button", "next-step", "final-step"]);

// Resolve steps as the user progresses
TutorialUiHightlight.Resolve("my-button");
```

## API Reference

### Core Functions

#### `SetTutorial(steps: string[])`

Starts a new tutorial with the specified steps.

```tsx
TutorialUiHightlight.SetTutorial(["step1", "step2", "step3"]);
```

#### `Resolve(id: string)`

Completes a tutorial step and moves to the next one.

```tsx
TutorialUiHightlight.Resolve("step1");
```

#### `StopTutorial()`

Immediately stops the current tutorial and clears all remaining steps.

```tsx
// Stop tutorial (e.g., if user clicks "Skip Tutorial")
TutorialUiHightlight.StopTutorial();
```

#### `ReportGuiInstance(instance: GuiBase2d, id: string)`

Manually register a GUI instance for highlighting.

#### `RemoveGuiInstance(id: string)`

Unregister a GUI instance.

### Configuration

#### `SetGlobalConfig(config: IStepData)`

Set default configuration for all tutorial steps.

```tsx
TutorialUiHightlight.SetGlobalConfig({
	BgColor3: Color3.fromRGB(0, 0, 0),
	BgTransparency: 0.5,
	CanClickCenter: false,
});
```

#### `SetStepConfig(step: string, config: IStepData)`

Set configuration for a specific step.

```tsx
TutorialUiHightlight.SetStepConfig("important-step", {
	BgColor3: Color3.fromRGB(255, 0, 0),
	BgTransparency: 0.2,
	CanClickCenter: true,
});
```

### React Hooks

#### `useReportUiRectRef<T>(id: string, ref?: React.MutableRefObject<T>)`

Returns a ref callback that automatically registers/unregisters the element. The optional `ref` parameter allows you to still maintain your own reference to the element if needed.

```tsx
// Basic usage - just for tutorial highlighting
const myRef = TutorialUiHightlight.useReportUiRectRef("my-element");

// Advanced usage - when you need both tutorial highlighting AND your own ref
const myElementRef = useRef<TextButton>();
const tutorialRef = TutorialUiHightlight.useReportUiRectRef("my-element", myElementRef);

return (
	<textbutton
		ref={tutorialRef}
		// Now you can also access the element via myElementRef.current
	/>
);
```

#### `useIsTutorialActive(): boolean`

Returns whether any tutorial is currently active. Use this to disable other UI elements during tutorials.

```tsx
function MyButton() {
	const isTutorialActive = TutorialUiHightlight.useIsTutorialActive();

	return (
		<textbutton
			Text="My Button"
			// Disable button during tutorial unless it's part of the tutorial
			Event={{
				MouseButton1Click: isTutorialActive ? undefined : handleClick,
			}}
			BackgroundTransparency={isTutorialActive ? 0.5 : 0}
		/>
	);
}
```

#### `useCurrentTutorialStep(): string | undefined`

Returns the current tutorial step ID. Use this to show contextual UI overlays or "Next" buttons for steps that don't require clicking.

```tsx
function TutorialOverlay() {
	const currentStep = TutorialUiHightlight.useCurrentTutorialStep();
	const isTutorialActive = TutorialUiHightlight.useIsTutorialActive();

	if (!isTutorialActive || !currentStep) return null;

	// Show "Next" button for read-only steps
	const isReadOnlyStep = currentStep === "read-instructions";

	return (
		<frame>
			{isReadOnlyStep && (
				<textbutton
					Text="Next"
					Position={UDim2.fromScale(0.9, 0.9)}
					Event={{
						MouseButton1Click: () => TutorialUiHightlight.Resolve(currentStep),
					}}
				/>
			)}

			{/* Step-specific instructions */}
			{currentStep === "click-settings" && (
				<textlabel Text="Click the Settings button to continue" />
			)}
		</frame>
	);
}
```

### Interfaces

```tsx
interface IStepData {
	BgColor3: Color3; // Background overlay color
	BgTransparency: number; // Background transparency (0-1)
	CanClickCenter: boolean; // Whether the highlighted area is clickable
}

interface IPartData {
	Position: UDim2;
	Size: UDim2;
	AnchorPoint: Vector2;
}
```

## Complete Example

```tsx
// TutorialExample.tsx
import React, { useState } from "@rbxts/react";
import { TutorialUiHightlight, HighlightGui } from "@rbxts/tutorial-ui-highlight";

enum TutorialSteps {
	OpenMenu = "open-menu",
	ClickSettings = "click-settings",
	CloseMenu = "close-menu",
}

function TutorialExample() {
	const [menuOpen, setMenuOpen] = useState(false);

	// Register refs
	const menuButtonRef = TutorialUiHightlight.useReportUiRectRef(TutorialSteps.OpenMenu);
	const settingsButtonRef = TutorialUiHightlight.useReportUiRectRef(TutorialSteps.ClickSettings);
	const closeButtonRef = TutorialUiHightlight.useReportUiRectRef(TutorialSteps.CloseMenu);

	// Start tutorial
	const startTutorial = () => {
		TutorialUiHightlight.SetTutorial([
			TutorialSteps.OpenMenu,
			TutorialSteps.ClickSettings,
			TutorialSteps.CloseMenu,
		]);
	};

	return (
		<screengui>
			{/* Tutorial overlay */}
			<HighlightGui />

			{/* Main UI */}
			<textbutton
				ref={menuButtonRef}
				Text="Open Menu"
				Position={UDim2.fromScale(0.1, 0.1)}
				Size={UDim2.fromOffset(100, 50)}
				Event={{
					MouseButton1Click: () => {
						setMenuOpen(true);
						TutorialUiHightlight.Resolve(TutorialSteps.OpenMenu);
					},
				}}
			/>

			{menuOpen && (
				<frame Position={UDim2.fromScale(0.3, 0.3)} Size={UDim2.fromOffset(200, 300)}>
					<textbutton
						ref={settingsButtonRef}
						Text="Settings"
						Size={UDim2.fromOffset(150, 40)}
						Event={{
							MouseButton1Click: () => {
								TutorialUiHightlight.Resolve(TutorialSteps.ClickSettings);
							},
						}}
					/>

					<textbutton
						ref={closeButtonRef}
						Text="Close"
						Position={UDim2.fromScale(0, 0.8)}
						Size={UDim2.fromOffset(150, 40)}
						Event={{
							MouseButton1Click: () => {
								setMenuOpen(false);
								TutorialUiHightlight.Resolve(TutorialSteps.CloseMenu);
							},
						}}
					/>
				</frame>
			)}

			<textbutton
				Text="Start Tutorial"
				Position={UDim2.fromScale(0.8, 0.1)}
				Size={UDim2.fromOffset(120, 50)}
				Event={{ MouseButton1Click: startTutorial }}
			/>
		</screengui>
	);
}
```

## Configuration Examples

### Custom Step Styling

```tsx
// Make a step have a red overlay with low transparency
TutorialUiHightlight.SetStepConfig("critical-step", {
	BgColor3: Color3.fromRGB(139, 0, 0),
	BgTransparency: 0.1,
	CanClickCenter: false,
});

// Make another step completely non-interactive
TutorialUiHightlight.SetStepConfig("read-only-step", {
	BgColor3: Color3.fromRGB(0, 0, 0),
	BgTransparency: 0.7,
	CanClickCenter: false,
});
```

### Global Configuration

```tsx
// Set up global defaults
TutorialUiHightlight.SetGlobalConfig({
	BgColor3: Color3.fromRGB(25, 25, 25),
	BgTransparency: 0.4,
	CanClickCenter: true,
});
```

## Advanced Usage Patterns

### Disabling UI During Tutorials

Disable other UI elements while a tutorial is active to guide user focus:

```tsx
function GameUI() {
	const isTutorialActive = TutorialUiHightlight.useIsTutorialActive();

	return (
		<screengui>
			<textbutton
				Text="Play"
				Event={{
					MouseButton1Click: isTutorialActive ? undefined : startGame,
				}}
				BackgroundTransparency={isTutorialActive ? 0.7 : 0}
			/>

			<textbutton
				Text="Settings"
				Event={{
					MouseButton1Click: isTutorialActive ? undefined : openSettings,
				}}
				BackgroundTransparency={isTutorialActive ? 0.7 : 0}
			/>
		</screengui>
	);
}
```

### Tutorial with Overlay Instructions

Create tutorials with contextual instructions and "Next" buttons for read-only steps:

```tsx
function TutorialWithInstructions() {
	const currentStep = TutorialUiHightlight.useCurrentTutorialStep();
	const isTutorialActive = TutorialUiHightlight.useIsTutorialActive();

	// Configure read-only steps
	useEffect(() => {
		TutorialUiHightlight.SetStepConfig("read-instructions", {
			BgColor3: Color3.fromRGB(0, 0, 0),
			BgTransparency: 0.5,
			CanClickCenter: false, // Prevent clicking the highlighted area
		});
	}, []);

	const stepInstructions = {
		"read-instructions": "Welcome! This is your dashboard.",
		"click-play": "Click the Play button to start a game.",
		"click-settings": "Now try opening the Settings menu.",
	};

	return (
		<>
			{/* Your main UI */}
			<MainGameUI />

			{/* Tutorial overlay */}
			{isTutorialActive && currentStep && (
				<screengui ZIndexBehavior={Enum.ZIndexBehavior.Sibling}>
					{/* Instruction text */}
					<frame
						Position={UDim2.fromScale(0.5, 0.1)}
						Size={UDim2.fromOffset(400, 100)}
						AnchorPoint={new Vector2(0.5, 0)}
					>
						<textlabel
							Text={stepInstructions[currentStep] || ""}
							Size={UDim2.fromScale(1, 1)}
							TextScaled={true}
						/>
					</frame>

					{/* Next button for read-only steps */}
					{currentStep === "read-instructions" && (
						<textbutton
							Text="Next"
							Position={UDim2.fromScale(0.85, 0.85)}
							Size={UDim2.fromOffset(100, 40)}
							Event={{
								MouseButton1Click: () => TutorialUiHightlight.Resolve(currentStep),
							}}
						/>
					)}

					{/* Skip tutorial button */}
					<textbutton
						Text="Skip Tutorial"
						Position={UDim2.fromScale(0.02, 0.02)}
						Size={UDim2.fromOffset(120, 30)}
						Event={{
							MouseButton1Click: () => TutorialUiHightlight.StopTutorial(),
						}}
					/>
				</screengui>
			)}
		</>
	);
}
```

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
