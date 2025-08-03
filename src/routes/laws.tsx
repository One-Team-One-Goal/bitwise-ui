import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import LawsSidebar from '@/components/LawsSidebar'
import { lawContents } from '@/utils/lawsData'
import bitbotRightPoint from '@/assets/bitbot/right-point.svg'

export const Route = createFileRoute('/laws')({
	component: RouteComponent,
})



function RouteComponent() {
	const [selectedLawIdx, setSelectedLawIdx] = useState<number>(0)
	return (
		<div className="flex h-[calc(100vh-6rem)] pt-24 pl-30 w-3/5 m-auto p-8 mt-10 gap-x-20">
			<div className="flex-1">
				{selectedLawIdx === null ? (
					<div className="text-gray-700">Select a law from the sidebar to view details.</div>
				) : (
					<>
						<div className="text-2xl font-semibold mb-2">{lawContents[selectedLawIdx].title}</div>
						<div className="text-lg text-gray-800 whitespace-pre-line">{lawContents[selectedLawIdx].content}</div>

			<img
              src={bitbotRightPoint}
              alt="Bitbot Right Point"
              className="ml-[-140px] w-30 z-50 opacity-90 pointer-events-none select-none"
              draggable="false"
            />
					</>
				)}
			</div>	
			<LawsSidebar selectedLawIdx={selectedLawIdx ?? -1} onSelect={setSelectedLawIdx} />
		</div>
	)
}
