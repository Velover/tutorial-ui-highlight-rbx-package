import { atom, peek } from "@rbxts/charm";
import React, { useEffect, useMemo, useState } from "@rbxts/react";
import { useAtom } from "@rbxts/react-charm";
import { GuiService, Workspace } from "@rbxts/services";

export namespace TutorialUiHightlight {
	export interface IStepData {
		BgColor3: Color3;
		BgTransparency: number;
		CanClickCenter: boolean;
	}

	export interface IPartData {
		Position: UDim2;
		Size: UDim2;
		AnchorPoint: Vector2;
	}

	export interface IPartsData {
		TopLeft: IPartData;
		Top: IPartData;
		TopRight: IPartData;
		Right: IPartData;
		BottomRight: IPartData;
		Bottom: IPartData;
		BottomLeft: IPartData;
		Left: IPartData;
		Center: IPartData;
	}

	const gui_instances_map_atom = atom(new Map<string, GuiBase2d>());
	const tutorial_sequence_atom = atom<string[]>([]);
	let global_config: IStepData = {
		BgColor3: Color3.fromRGB(7, 7, 7),
		BgTransparency: 0.3,
		CanClickCenter: true,
	};
	const config_per_step_map = new Map<string, IStepData>();

	function useCamera(): Camera | undefined {
		const [camera, SetCamera] = useState(Workspace.CurrentCamera!);
		useEffect(() => {
			SetCamera(Workspace.CurrentCamera!);
			const c = Workspace.GetPropertyChangedSignal("CurrentCamera").Connect(() => {
				SetCamera(Workspace.CurrentCamera!);
			});
			return () => c.Disconnect();
		}, []);
		return camera;
	}

	export function ReportGuiInstance(instance: GuiBase2d, id: string) {
		gui_instances_map_atom((d) => {
			return table.clone(d).set(id, instance);
		});
	}

	export function RemoveGuiInstance(id: string) {
		gui_instances_map_atom((d) => {
			const new_map = table.clone(d);
			new_map.delete(id);
			return new_map;
		});
	}

	export function Resolve(id: string) {
		tutorial_sequence_atom((d) => {
			const index = d.indexOf(id);
			if (index === -1) return d;
			const new_sequence = table.clone(d);
			new_sequence.remove(index);
			return new_sequence;
		});
	}

	export function IsTutorialActive(): boolean {
		const sequence = peek(tutorial_sequence_atom);
		if (sequence === undefined) return false;
		return sequence.size() > 0;
	}

	/**Atom subscribable version of IsTutorialActive */
	export function IsTutorialActiveAtom(): boolean {
		const sequence = tutorial_sequence_atom();
		if (sequence === undefined) return false;
		return sequence.size() > 0;
	}

	export function SetGlobalConfig(config: IStepData) {
		global_config = table.clone(config);
	}

	export function SetStepConfig(step: string, config: IStepData) {
		config_per_step_map.set(step, table.clone(config));
	}

	export function SetTutorial(steps: string[]) {
		tutorial_sequence_atom(steps);
	}

	export function StopTutorial() {
		tutorial_sequence_atom([]);
	}

	export function GetStepConfig(step?: string): IStepData {
		if (step === undefined) return global_config;
		return config_per_step_map.get(step) ?? global_config;
	}

	export function useCurrentTutorialStep(): string | undefined {
		return useAtom(() => tutorial_sequence_atom()?.[0]);
	}
	export function useIsTutorialActive(): boolean {
		return useAtom(() => {
			const sequence = tutorial_sequence_atom();
			if (sequence === undefined) return false;
			return sequence.size() > 0;
		});
	}

	function Obj2DToRect(obj?: GuiBase2d): Rect {
		if (obj === undefined) return new Rect();
		const absolute_position = obj.AbsolutePosition;
		const absolute_size = obj.AbsoluteSize;
		return new Rect(absolute_position, absolute_position.add(absolute_size));
	}

	export function useGuiBounds(id?: string): Rect {
		const instance = useAtom(() => {
			if (id === undefined) return undefined;
			return gui_instances_map_atom().get(id);
		}, [id]);
		const [rect, SetRect] = useState(new Rect());
		useEffect(() => {
			SetRect(Obj2DToRect(instance));
			if (instance === undefined) return;
			const c = instance.GetPropertyChangedSignal("AbsolutePosition").Connect(() => {
				SetRect(Obj2DToRect(instance));
			});
			const c2 = instance.GetPropertyChangedSignal("AbsoluteSize").Connect(() => {
				SetRect(Obj2DToRect(instance));
			});
			return () => {
				c.Disconnect();
				c2.Disconnect();
			};
		}, [instance]);

		return rect;
	}

	function useViewportSize(): Vector2 {
		const current_camera = useCamera();
		const [viewport_size, SetViewportSize] = useState(current_camera?.ViewportSize ?? Vector2.zero);
		useEffect(() => {
			SetViewportSize(current_camera?.ViewportSize ?? Vector2.zero);
			if (current_camera === undefined) return;
			const c = current_camera?.GetPropertyChangedSignal("ViewportSize").Connect(() => {
				SetViewportSize(current_camera?.ViewportSize ?? Vector2.zero);
			});
			return () => c.Disconnect();
		}, [current_camera]);
		return viewport_size;
	}

	export function useParts(gui_bounds: Rect): IPartsData {
		const viewport_size = useViewportSize();

		return useMemo(() => {
			if (gui_bounds === new Rect()) {
				return {
					TopLeft: {
						AnchorPoint: new Vector2(1, 1),
						Position: ToUdim(-200, -200, viewport_size),
						Size: ToUdim(9999, 9999, viewport_size),
					},
					Top: {
						AnchorPoint: new Vector2(0, 1),
						Position: ToUdim(-200, -200, viewport_size),
						Size: ToUdim(viewport_size.X + 400, 9999, viewport_size),
					},
					TopRight: {
						AnchorPoint: new Vector2(0, 1),
						Position: ToUdim(viewport_size.X + 200, -200, viewport_size),
						Size: ToUdim(9999, 9999, viewport_size),
					},
					Right: {
						AnchorPoint: new Vector2(0, 0),
						Position: ToUdim(viewport_size.X + 200, -200, viewport_size),
						Size: ToUdim(9999, viewport_size.Y + 400, viewport_size),
					},
					BottomRight: {
						AnchorPoint: new Vector2(0, 0),
						Position: ToUdim(viewport_size.X + 200, viewport_size.Y + 200, viewport_size),
						Size: ToUdim(9999, 9999, viewport_size),
					},
					Bottom: {
						AnchorPoint: new Vector2(0, 0),
						Position: ToUdim(-200, viewport_size.Y + 200, viewport_size),
						Size: ToUdim(viewport_size.X + 400, 9999, viewport_size),
					},
					BottomLeft: {
						AnchorPoint: new Vector2(1, 0),
						Position: ToUdim(-200, viewport_size.Y + 200, viewport_size),
						Size: ToUdim(9999, 9999, viewport_size),
					},
					Left: {
						AnchorPoint: new Vector2(1, 0),
						Position: ToUdim(-200, -200, viewport_size),
						Size: ToUdim(9999, viewport_size.Y + 400, viewport_size),
					},
					Center: {
						AnchorPoint: new Vector2(0, 0),
						Position: ToUdim(0, 0, viewport_size),
						Size: ToUdim(viewport_size.X + 400, viewport_size.Y + 400, viewport_size),
					},
				} satisfies IPartsData;
			}

			return {
				TopLeft: {
					AnchorPoint: new Vector2(1, 1),
					Position: ToUdim(gui_bounds.Min.X, gui_bounds.Min.Y, viewport_size),
					Size: ToUdim(9999, 9999, viewport_size),
				},
				Top: {
					AnchorPoint: new Vector2(0, 1),
					Position: ToUdim(gui_bounds.Min.X, gui_bounds.Min.Y, viewport_size),
					Size: ToUdim(gui_bounds.Width, 9999, viewport_size),
				},
				TopRight: {
					AnchorPoint: new Vector2(0, 1),
					Position: ToUdim(gui_bounds.Max.X, gui_bounds.Min.Y, viewport_size),
					Size: ToUdim(9999, 9999, viewport_size),
				},
				Right: {
					AnchorPoint: new Vector2(0, 0),
					Position: ToUdim(gui_bounds.Max.X, gui_bounds.Min.Y, viewport_size),
					Size: ToUdim(9999, gui_bounds.Height, viewport_size),
				},
				BottomRight: {
					AnchorPoint: new Vector2(0, 0),
					Position: ToUdim(gui_bounds.Max.X, gui_bounds.Max.Y, viewport_size),
					Size: ToUdim(9999, 9999, viewport_size),
				},
				Bottom: {
					AnchorPoint: new Vector2(0, 0),
					Position: ToUdim(gui_bounds.Min.X, gui_bounds.Max.Y, viewport_size),
					Size: ToUdim(gui_bounds.Width, 9999, viewport_size),
				},
				BottomLeft: {
					AnchorPoint: new Vector2(1, 0),
					Position: ToUdim(gui_bounds.Min.X, gui_bounds.Max.Y, viewport_size),
					Size: ToUdim(9999, 9999, viewport_size),
				},
				Left: {
					AnchorPoint: new Vector2(1, 0),
					Position: ToUdim(gui_bounds.Min.X, gui_bounds.Min.Y, viewport_size),
					Size: ToUdim(9999, gui_bounds.Height, viewport_size),
				},
				Center: {
					AnchorPoint: new Vector2(0, 0),
					Position: ToUdim(gui_bounds.Min.X, gui_bounds.Min.Y, viewport_size),
					Size: ToUdim(gui_bounds.Width, gui_bounds.Height, viewport_size),
				},
			} satisfies IPartsData;
		}, [gui_bounds, viewport_size]);
	}

	function ToUdim(x: number, y: number, viewport_size: Vector2): UDim2 {
		return UDim2.fromScale(
			x / viewport_size.X,
			y / (viewport_size.Y - GuiService.TopbarInset.Height),
		);
	}

	export function useReportUiRectRef<T extends GuiBase2d = GuiBase2d>(
		id: string,
		ref?: React.MutableRefObject<T | undefined>,
	) {
		return (v?: T) => {
			if (ref !== undefined) {
				ref.current = v;
			}
			if (v !== undefined) {
				ReportGuiInstance(v, id);
				return;
			}
			RemoveGuiInstance(id);
		};
	}
}
