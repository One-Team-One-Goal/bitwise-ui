import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { AlertCircleIcon, Info } from 'lucide-react';

export const lawContents = [
	{
		title: 'Identity Law',
		content: (
			<div className="mt-3 space-y-6 w-full">
				<p className="text-base leading-relaxed">
					In Boolean algebra, the <span className="font-semibold">Identity Law</span> defines how Boolean variables behave when combined with identity elements.
					The identity element is the value that leaves the original variable unchanged when applied in an operation.
				</p>
				<Table className="border border-gray-300 rounded">
					<TableHeader className="bg-gray-100">
						<TableRow>
							<TableHead className="px-4 py-2 border-b text-left font-semibold text-sm text-gray-700">Law</TableHead>
							<TableHead className="px-4 py-2 border-b text-left font-semibold text-sm text-gray-700">Expression</TableHead>
							<TableHead className="px-4 py-2 border-b text-left font-semibold text-sm text-gray-700 max-w-xs">Explanation</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						<TableRow>
							<TableCell className="px-4 py-2 border-b font-medium">Identity Law (AND)</TableCell>
							<TableCell className="px-4 py-2 border-b">A · 1 = A</TableCell>
							<TableCell className="px-4 py-2 border-b whitespace-normal break-words max-w-xs">
								When a Boolean variable A is ANDed with 1, the result is A. This is because 1 is the identity element for the AND operation.
							</TableCell>
						</TableRow>
						<TableRow>
							<TableCell className="px-4 py-2 border-b font-medium">Identity Law (OR)</TableCell>
							<TableCell className="px-4 py-2 border-b">A + 0 = A</TableCell>
							<TableCell className="px-4 py-2 border-b whitespace-normal break-words max-w-xs">
								When a Boolean variable A is ORed with 0, the result is A. This is because 0 is the identity element for the OR operation.
							</TableCell>
						</TableRow>
					</TableBody>
				</Table>
				<p className="text-base leading-relaxed">
					The Identity Law helps simplify Boolean expressions and is frequently used when minimizing logic circuits.
				</p>
				<Alert variant={"informative"}>
					<Info className="text-[var(--color-bluez)]" />
					<AlertTitle>
						The Identity Law is so fundamental that it appears in many branches of mathematics, not just Boolean algebra!
					</AlertTitle>
				</Alert>
			</div>
		),
	},
	{
		title: 'Null Law',
		content: (
			<div className="mt-3 space-y-6 w-full">
				<p className="text-base leading-relaxed">
					In Boolean algebra, the <span className="font-semibold">Null Law</span> describes how Boolean variables behave when combined with the null elements 0 and 1.
				</p>
				<Table className="border border-gray-300 rounded">
					<TableHeader className="bg-gray-100">
						<TableRow>
							<TableHead className="px-4 py-2 border-b text-left font-semibold text-sm text-gray-700">Law</TableHead>
							<TableHead className="px-4 py-2 border-b text-left font-semibold text-sm text-gray-700">Expression</TableHead>
							<TableHead className="px-4 py-2 border-b text-left font-semibold text-sm text-gray-700 max-w-xs">Explanation</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						<TableRow>
							<TableCell className="px-4 py-2 border-b font-medium">Null Law (AND)</TableCell>
							<TableCell className="px-4 py-2 border-b">A · 0 = 0</TableCell>
							<TableCell className="px-4 py-2 border-b whitespace-normal break-words max-w-xs">
								When a Boolean variable A is ANDed with 0, the result is always 0. This is because 0 is the null element for the AND operation.
							</TableCell>
						</TableRow>
						<TableRow>
							<TableCell className="px-4 py-2 border-b font-medium">Null Law (OR)</TableCell>
							<TableCell className="px-4 py-2 border-b">A + 1 = 1</TableCell>
							<TableCell className="px-4 py-2 border-b whitespace-normal break-words max-w-xs">
								When a Boolean variable A is ORed with 1, the result is always 1. This is because 1 is the null element for the OR operation.
							</TableCell>
						</TableRow>
					</TableBody>
				</Table>
				<p className="text-base leading-relaxed">
					The Null Law is useful for quickly simplifying Boolean expressions that include 0 or 1.
				</p>
				<Alert variant={"informative"}>
					<Info className="text-[var(--color-bluez)]" />
					<AlertTitle>
						The Null Law is sometimes called the "annihilator law" because 0 and 1 can "annihilate" any variable in AND/OR operations.
					</AlertTitle>
				</Alert>
			</div>
		),
	},
	{
		title: 'Idempotent Law',
		content: (
			<div className="mt-3 space-y-6 w-full">
				<p className="text-base leading-relaxed">
					In Boolean algebra, the <span className="font-semibold">Idempotent Law</span> shows that combining a variable with itself does not change its value.
				</p>
				<Table className="border border-gray-300 rounded">
					<TableHeader className="bg-gray-100">
						<TableRow>
							<TableHead className="px-4 py-2 border-b text-left font-semibold text-sm text-gray-700">Law</TableHead>
							<TableHead className="px-4 py-2 border-b text-left font-semibold text-sm text-gray-700">Expression</TableHead>
							<TableHead className="px-4 py-2 border-b text-left font-semibold text-sm text-gray-700 max-w-xs">Explanation</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						<TableRow>
							<TableCell className="px-4 py-2 border-b font-medium">Idempotent Law (AND)</TableCell>
							<TableCell className="px-4 py-2 border-b">A · A = A</TableCell>
							<TableCell className="px-4 py-2 border-b whitespace-normal break-words max-w-xs">
								When a Boolean variable A is ANDed with itself, the result is A. This is because repeating the AND operation does not change the value.
							</TableCell>
						</TableRow>
						<TableRow>
							<TableCell className="px-4 py-2 border-b font-medium">Idempotent Law (OR)</TableCell>
							<TableCell className="px-4 py-2 border-b">A + A = A</TableCell>
							<TableCell className="px-4 py-2 border-b whitespace-normal break-words max-w-xs">
								When a Boolean variable A is ORed with itself, the result is A. This is because repeating the OR operation does not change the value.
							</TableCell>
						</TableRow>
					</TableBody>
				</Table>
				<p className="text-base leading-relaxed">
					The Idempotent Law is useful for simplifying expressions by removing duplicate variables.
				</p>
				<Alert variant={"informative"}>
					<Info className="text-[var(--color-bluez)]" />
					<AlertTitle>
						The word "idempotent" comes from Latin and means "the same power"—applying the operation multiple times doesn't change the result!
					</AlertTitle>
				</Alert>
			</div>
		),
	},
	{
		title: 'Inverse Law',
		content: (
			<div className="mt-3 space-y-6 w-full">
				<p className="text-base leading-relaxed">
					In Boolean algebra, the <span className="font-semibold">Inverse Law</span> shows how a variable and its complement interact.
				</p>
				<Table className="border border-gray-300 rounded">
					<TableHeader className="bg-gray-100">
						<TableRow>
							<TableHead className="px-4 py-2 border-b text-left font-semibold text-sm text-gray-700">Law</TableHead>
							<TableHead className="px-4 py-2 border-b text-left font-semibold text-sm text-gray-700">Expression</TableHead>
							<TableHead className="px-4 py-2 border-b text-left font-semibold text-sm text-gray-700 max-w-xs">Explanation</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						<TableRow>
							<TableCell className="px-4 py-2 border-b font-medium">Inverse Law (AND)</TableCell>
							<TableCell className="px-4 py-2 border-b">A · A' = 0</TableCell>
							<TableCell className="px-4 py-2 border-b whitespace-normal break-words max-w-xs">
								A ANDed with its complement is always 0.
							</TableCell>
						</TableRow>
						<TableRow>
							<TableCell className="px-4 py-2 border-b font-medium">Inverse Law (OR)</TableCell>
							<TableCell className="px-4 py-2 border-b">A + A' = 1</TableCell>
							<TableCell className="px-4 py-2 border-b whitespace-normal break-words max-w-xs">
								A ORed with its complement is always 1.
							</TableCell>
						</TableRow>
					</TableBody>
				</Table>
				<p className="text-base leading-relaxed">
					The Inverse Law is essential for simplifying expressions with complements.
				</p>
				<Alert variant={"informative"}>
					<Info className="text-[var(--color-bluez)]" />
					<AlertTitle>
						The Inverse Law is the Boolean equivalent of a number plus its negative being zero, or a number times its reciprocal being one!
					</AlertTitle>
				</Alert>
			</div>
		),
	},
	{
		title: 'Commutative Law',
		content: (
			<div className="mt-3 space-y-6 w-full">
				<p className="text-base leading-relaxed">
					The <span className="font-semibold">Commutative Law</span> states that the order of variables does not affect the result of AND or OR operations.
				</p>
				<Table className="border border-gray-300 rounded">
					<TableHeader className="bg-gray-100">
						<TableRow>
							<TableHead className="px-4 py-2 border-b text-left font-semibold text-sm text-gray-700">Law</TableHead>
							<TableHead className="px-4 py-2 border-b text-left font-semibold text-sm text-gray-700">Expression</TableHead>
							<TableHead className="px-4 py-2 border-b text-left font-semibold text-sm text-gray-700 max-w-xs">Explanation</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						<TableRow>
							<TableCell className="px-4 py-2 border-b font-medium">Commutative Law (AND)</TableCell>
							<TableCell className="px-4 py-2 border-b">A · B = B · A</TableCell>
							<TableCell className="px-4 py-2 border-b whitespace-normal break-words max-w-xs">
								Changing the order of ANDed variables does not change the result.
							</TableCell>
						</TableRow>
						<TableRow>
							<TableCell className="px-4 py-2 border-b font-medium">Commutative Law (OR)</TableCell>
							<TableCell className="px-4 py-2 border-b">A + B = B + A</TableCell>
							<TableCell className="px-4 py-2 border-b whitespace-normal break-words max-w-xs">
								Changing the order of ORed variables does not change the result.
							</TableCell>
						</TableRow>
					</TableBody>
				</Table>
				<p className="text-base leading-relaxed">
					The Commutative Law is useful for rearranging terms in Boolean expressions.
				</p>
				<Alert variant={"informative"}>
					<Info className="text-[var(--color-bluez)]" />
					<AlertTitle>
						The Commutative Law also holds for addition and multiplication in regular arithmetic, not just Boolean algebra!
					</AlertTitle>
				</Alert>
			</div>
		),
	},
	{
		title: 'Associative Law',
		content: (
			<div className="mt-3 space-y-6 w-full">
				<p className="text-base leading-relaxed">
					The <span className="font-semibold">Associative Law</span> states that grouping of variables does not affect the result of AND or OR operations.
				</p>
				<Table className="border border-gray-300 rounded">
					<TableHeader className="bg-gray-100">
						<TableRow>
							<TableHead className="px-4 py-2 border-b text-left font-semibold text-sm text-gray-700">Law</TableHead>
							<TableHead className="px-4 py-2 border-b text-left font-semibold text-sm text-gray-700">Expression</TableHead>
							<TableHead className="px-4 py-2 border-b text-left font-semibold text-sm text-gray-700 max-w-xs">Explanation</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						<TableRow>
							<TableCell className="px-4 py-2 border-b font-medium">Associative Law (AND)</TableCell>
							<TableCell className="px-4 py-2 border-b">(A · B) · C = A · (B · C)</TableCell>
							<TableCell className="px-4 py-2 border-b whitespace-normal break-words max-w-xs">
								Grouping ANDed variables in any way does not change the result.
							</TableCell>
						</TableRow>
						<TableRow>
							<TableCell className="px-4 py-2 border-b font-medium">Associative Law (OR)</TableCell>
							<TableCell className="px-4 py-2 border-b">(A + B) + C = A + (B + C)</TableCell>
							<TableCell className="px-4 py-2 border-b whitespace-normal break-words max-w-xs">
								Grouping ORed variables in any way does not change the result.
							</TableCell>
						</TableRow>
					</TableBody>
				</Table>
				<p className="text-base leading-relaxed">
					The Associative Law is helpful for simplifying and regrouping Boolean expressions.
				</p>
				<Alert variant={"informative"}>
					<Info className="text-[var(--color-bluez)]" />
					<AlertTitle>
						The Associative Law means you can group variables however you like—parentheses don't matter for AND/OR!
					</AlertTitle>
				</Alert>
			</div>
		),
	},
	{
		title: 'Distributive Law',
		content: (
			<div className="mt-3 space-y-6 w-full">
				<p className="text-base leading-relaxed">
					The <span className="font-semibold">Distributive Law</span> shows how AND distributes over OR and vice versa.
				</p>
				<Table className="border border-gray-300 rounded">
					<TableHeader className="bg-gray-100">
						<TableRow>
							<TableHead className="px-4 py-2 border-b text-left font-semibold text-sm text-gray-700">Law</TableHead>
							<TableHead className="px-4 py-2 border-b text-left font-semibold text-sm text-gray-700">Expression</TableHead>
							<TableHead className="px-4 py-2 border-b text-left font-semibold text-sm text-gray-700 max-w-xs">Explanation</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						<TableRow>
							<TableCell className="px-4 py-2 border-b font-medium">Distributive Law (OR over AND)</TableCell>
							<TableCell className="px-4 py-2 border-b">A + (B · C) = (A + B) · (A + C)</TableCell>
							<TableCell className="px-4 py-2 border-b whitespace-normal break-words max-w-xs">
								OR distributes over AND: A + (B · C) = (A + B) · (A + C)
							</TableCell>
						</TableRow>
						<TableRow>
							<TableCell className="px-4 py-2 border-b font-medium">Distributive Law (AND over OR)</TableCell>
							<TableCell className="px-4 py-2 border-b">A · (B + C) = (A · B) + (A · C)</TableCell>
							<TableCell className="px-4 py-2 border-b whitespace-normal break-words max-w-xs">
								AND distributes over OR: A · (B + C) = (A · B) + (A · C)
							</TableCell>
						</TableRow>
					</TableBody>
				</Table>
				<p className="text-base leading-relaxed">
					The Distributive Law is key for factoring and expanding Boolean expressions.
				</p>
				<Alert variant={"informative"}>
					<Info className="text-[var(--color-bluez)]" />
					<AlertTitle>
						The Distributive Law is unique in Boolean algebra because it works both ways: AND over OR and OR over AND!
					</AlertTitle>
				</Alert>
			</div>
		),
	},
	{
		title: "DeMorgan's Law",
		content: (
			<div className="mt-3 space-y-6 w-full">
				<p className="text-base leading-relaxed">
					<span className="font-semibold">DeMorgan's Law</span> provides a way to distribute negation over AND and OR operations.
				</p>
				<Table className="border border-gray-300 rounded">
					<TableHeader className="bg-gray-100">
						<TableRow>
							<TableHead className="px-4 py-2 border-b text-left font-semibold text-sm text-gray-700">Law</TableHead>
							<TableHead className="px-4 py-2 border-b text-left font-semibold text-sm text-gray-700">Expression</TableHead>
							<TableHead className="px-4 py-2 border-b text-left font-semibold text-sm text-gray-700 max-w-xs">Explanation</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						<TableRow>
							<TableCell className="px-4 py-2 border-b font-medium">DeMorgan's Law (AND)</TableCell>
							<TableCell className="px-4 py-2 border-b">(A · B)' = A' + B'</TableCell>
							<TableCell className="px-4 py-2 border-b whitespace-normal break-words max-w-xs">
								The complement of an AND is the OR of the complements.
							</TableCell>
						</TableRow>
						<TableRow>
							<TableCell className="px-4 py-2 border-b font-medium">DeMorgan's Law (OR)</TableCell>
							<TableCell className="px-4 py-2 border-b">(A + B)' = A' · B'</TableCell>
							<TableCell className="px-4 py-2 border-b whitespace-normal break-words max-w-xs">
								The complement of an OR is the AND of the complements.
							</TableCell>
						</TableRow>
					</TableBody>
				</Table>
				<p className="text-base leading-relaxed">
					DeMorgan's Law is essential for simplifying and complementing Boolean expressions.
				</p>
				<Alert variant={"informative"}>
					<Info className="text-[var(--color-bluez)]" />
					<AlertTitle>
						DeMorgan's Laws are named after Augustus De Morgan, a 19th-century British mathematician and logician!
					</AlertTitle>
				</Alert>
			</div>
		),
	},
	{
		title: 'Double Complement Law',
		content: (
			<div className="mt-3 space-y-6 w-full">
				<p className="text-base leading-relaxed">
					The <span className="font-semibold">Double Complement Law</span> states that taking the complement twice returns the original variable.
				</p>
				<Table className="border border-gray-300 rounded">
					<TableHeader className="bg-gray-100">
						<TableRow>
							<TableHead className="px-4 py-2 border-b text-left font-semibold text-sm text-gray-700">Law</TableHead>
							<TableHead className="px-4 py-2 border-b text-left font-semibold text-sm text-gray-700">Expression</TableHead>
							<TableHead className="px-4 py-2 border-b text-left font-semibold text-sm text-gray-700 max-w-xs">Explanation</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						<TableRow>
							<TableCell className="px-4 py-2 border-b font-medium">Double Complement Law</TableCell>
							<TableCell className="px-4 py-2 border-b">(A')' = A</TableCell>
							<TableCell className="px-4 py-2 border-b whitespace-normal break-words max-w-xs">
								The complement of the complement of A is A itself.
							</TableCell>
						</TableRow>
					</TableBody>
				</Table>
				<p className="text-base leading-relaxed">
					The Double Complement Law is useful for removing double negations in expressions.
				</p>
				<Alert variant={"informative"}>
					<Info className="text-[var(--color-bluez)]" />
					<AlertTitle>
						Double negation is also a rule in classical logic and natural language—"not not A" means just "A"!
					</AlertTitle>
				</Alert>
			</div>
		),
	},
	{
		title: 'Absorption Law',
		content: (
			<div className="mt-3 space-y-6 w-full">
				<p className="text-base leading-relaxed">
					The <span className="font-semibold">Absorption Law</span> shows how certain terms can be absorbed into others to simplify expressions.
				</p>
				<Table className="border border-gray-300 rounded">
					<TableHeader className="bg-gray-100">
						<TableRow>
							<TableHead className="px-4 py-2 border-b text-left font-semibold text-sm text-gray-700">Law</TableHead>
							<TableHead className="px-4 py-2 border-b text-left font-semibold text-sm text-gray-700">Expression</TableHead>
							<TableHead className="px-4 py-2 border-b text-left font-semibold text-sm text-gray-700 max-w-xs">Explanation</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						<TableRow>
							<TableCell className="px-4 py-2 border-b font-medium">Absorption Law 1</TableCell>
							<TableCell className="px-4 py-2 border-b">A + AB = A</TableCell>
							<TableCell className="px-4 py-2 border-b whitespace-normal break-words max-w-xs">
								A absorbs AB, so the result is A.
							</TableCell>
						</TableRow>
						<TableRow>
							<TableCell className="px-4 py-2 border-b font-medium">Absorption Law 2</TableCell>
							<TableCell className="px-4 py-2 border-b">A(A + B) = A</TableCell>
							<TableCell className="px-4 py-2 border-b whitespace-normal break-words max-w-xs">
								A ANDed with (A OR B) is just A.
							</TableCell>
						</TableRow>
						<TableRow>
							<TableCell className="px-4 py-2 border-b font-medium">Absorption Law 3</TableCell>
							<TableCell className="px-4 py-2 border-b">A + A'B = A + B</TableCell>
							<TableCell className="px-4 py-2 border-b whitespace-normal break-words max-w-xs">
								A ORed with A'B is the same as A OR B.
							</TableCell>
						</TableRow>
						<TableRow>
							<TableCell className="px-4 py-2 border-b font-medium">Absorption Law 4</TableCell>
							<TableCell className="px-4 py-2 border-b">A(A' + B) = AB</TableCell>
							<TableCell className="px-4 py-2 border-b whitespace-normal break-words max-w-xs">
								A ANDed with (A' OR B) is just AB.
							</TableCell>
						</TableRow>
					</TableBody>
				</Table>
				<p className="text-base leading-relaxed">
					The Absorption Law is powerful for reducing complex Boolean expressions.
				</p>
				<Alert variant={"informative"}>
					<Info className="text-[var(--color-bluez)]" />
					<AlertTitle>
						Absorption is a key step in many logic circuit simplifications and is used in digital design tools!
					</AlertTitle>
				</Alert>
			</div>
		),
	},
]