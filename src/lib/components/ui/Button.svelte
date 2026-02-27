<script lang="ts">
	import { cn } from "$lib/utils";

	let className: string | undefined = undefined;
	export { className as class };
	export let variant: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link' = 'default';
	export let size: 'default' | 'sm' | 'lg' | 'icon' = 'default';

	const variants = {
		default: 'bg-yellow-500 text-yellow-950 hover:bg-yellow-600',
		destructive: 'bg-red-600 text-white hover:bg-red-700',
		outline: 'border border-gray-300 bg-white hover:bg-gray-100',
		secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300',
		ghost: 'hover:bg-gray-100',
		link: 'text-yellow-600 underline-offset-4 hover:underline'
	};

	const sizes = {
		default: 'h-10 px-4 py-2',
		sm: 'h-9 rounded-md px-3 text-xs',
		lg: 'h-11 rounded-md px-8',
		icon: 'h-10 w-10'
	};
</script>

<button
	class={cn(
		'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
		variants[variant],
		sizes[size],
		className
	)}
	{...$$restProps}
>
	<slot />
</button>
