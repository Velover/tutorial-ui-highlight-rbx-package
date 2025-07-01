import React from "@rbxts/react";
import { TutorialUiHightlight } from "./TutorialUiHightlight";

function BlackPart({
	PartData,
	StepConfig,
}: {
	PartData: TutorialUiHightlight.IPartData;
	StepConfig: TutorialUiHightlight.IStepData;
}) {
	return (
		<textbutton
		Text={""}
			BorderSizePixel={0}
			BackgroundColor3={StepConfig.BgColor3}
			Position={PartData.Position}
			AnchorPoint={PartData.AnchorPoint}
			AutoButtonColor={false}
			BackgroundTransparency={StepConfig.BgTransparency}
			Size={PartData.Size}
		/>
	);
}

function InvisibleButton({ PartData, Enabled }: { PartData: TutorialUiHightlight.IPartData; Enabled?: boolean }) {
	return (
		<textbutton
			Visible={Enabled}
			Text={""}
			AutoButtonColor={false}
			BorderSizePixel={0}
			Position={PartData.Position}
			AnchorPoint={PartData.AnchorPoint}
			BackgroundTransparency={1}
			Size={PartData.Size}
		/>
	);
}

export function HighlightGui() {	
	const is_active = TutorialUiHightlight.useIsTutorialActive();
	const step_id = TutorialUiHightlight.useCurrentTutorialStep();

	const step_rect = TutorialUiHightlight.useGuiBounds(step_id);
	const parts = TutorialUiHightlight.useParts(step_rect);
	const config = TutorialUiHightlight.GetStepConfig(step_id);

	return (
		<screengui
			Enabled={is_active}
			ResetOnSpawn={false}			
			ClipToDeviceSafeArea={false}
		>
			<BlackPart key={"TLeft"} PartData={parts.TopLeft} StepConfig={config} />
			<BlackPart key={"T"} PartData={parts.Top} StepConfig={config} />
			<BlackPart key={"TR"} PartData={parts.TopRight} StepConfig={config} />
			<BlackPart key={"BL"} PartData={parts.BottomLeft} StepConfig={config} />
			<BlackPart key={"B"} PartData={parts.Bottom} StepConfig={config} />
			<BlackPart key={"BR"} PartData={parts.BottomRight} StepConfig={config} />
			<BlackPart key={"L"} PartData={parts.Left} StepConfig={config} />
			<BlackPart key={"R"} PartData={parts.Right} StepConfig={config} />
			<InvisibleButton key={"C"} PartData={parts.Center} Enabled={!config.CanClickCenter} />
		</screengui>
	);
}
