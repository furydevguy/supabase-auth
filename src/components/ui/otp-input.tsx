    "use client";

import { useEffect, useMemo, useRef } from "react";
import { Input } from "@/components/ui/input";

export interface OtpInputProps {
	value: string;
	onChange: (next: string) => void;
	length?: number;
	disabled?: boolean;
	name?: string;
}

export function OtpInput({ value, onChange, length = 6, disabled, name }: OtpInputProps) {
	const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

	const digits = useMemo(() => {
		const onlyDigits = (value || "").replace(/\D/g, "").slice(0, length);
		return Array.from({ length }, (_, i) => onlyDigits[i] ?? "");
	}, [value, length]);

	useEffect(() => {
		inputsRef.current = inputsRef.current.slice(0, length);
	}, [length]);

	function focusIndex(index: number) {
		const target = inputsRef.current[index];
		if (target) target.focus();
	}

	function setAt(index: number, char: string) {
		const newDigits = [...digits];
		newDigits[index] = char;
		onChange(newDigits.join(""));
	}

	function handleChange(index: number, e: React.ChangeEvent<HTMLInputElement>) {
		const next = e.target.value.replace(/\D/g, "");
		if (next.length === 0) {
			setAt(index, "");
			return;
		}
		// Support typing multiple digits at once (IME/paste into one box)
		const chars = next.slice(0, length - index).split("");
		const newDigits = [...digits];
		for (let i = 0; i < chars.length; i++) {
			newDigits[index + i] = chars[i] ?? "";
		}
		onChange(newDigits.join(""));
		const nextIndex = Math.min(index + chars.length, length - 1);
		focusIndex(nextIndex);
	}

	function handleKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
		if (e.key === "Backspace") {
			if (digits[index]) {
				setAt(index, "");
				return;
			}
			const prev = Math.max(0, index - 1);
			setAt(prev, "");
			focusIndex(prev);
		}
		if (e.key === "ArrowLeft") {
			e.preventDefault();
			focusIndex(Math.max(0, index - 1));
		}
		if (e.key === "ArrowRight") {
			e.preventDefault();
			focusIndex(Math.min(length - 1, index + 1));
		}
	}

	function handlePaste(index: number, e: React.ClipboardEvent<HTMLInputElement>) {
		e.preventDefault();
		const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
		if (!text) return;
		const newDigits = [...digits];
		for (let i = 0; i < text.length; i++) {
			const targetIndex = index + i;
			if (targetIndex >= length) break;
			newDigits[targetIndex] = text[i] ?? "";
		}
		onChange(newDigits.join(""));
		const nextIndex = Math.min(index + text.length - 1, length - 1);
		focusIndex(nextIndex);
	}

	return (
		<div className="flex items-center justify-between gap-2">
			{Array.from({ length }).map((_, idx) => (
				<Input
					key={idx}
					ref={(el) => {
						inputsRef.current[idx] = el;
					}}
					name={name ? `${name}-${idx + 1}` : undefined}
					inputMode="numeric"
					pattern="[0-9]*"
					maxLength={length}
					value={digits[idx]}
					onChange={(e) => handleChange(idx, e)}
					onKeyDown={(e) => handleKeyDown(idx, e)}
					onPaste={(e) => handlePaste(idx, e)}
					disabled={disabled}
					className="h-12 w-12 text-center text-lg tracking-widest"
					aria-label={`Digit ${idx + 1}`}
				/>
			))}
		</div>
	);
}

export default OtpInput;


