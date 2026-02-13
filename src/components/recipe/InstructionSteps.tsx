import { Instruction } from '@/lib/adapters/types';

interface InstructionStepsProps {
  instructions: Instruction[];
}

export default function InstructionSteps({
  instructions,
}: InstructionStepsProps) {
  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Instrucciones</h2>
      <ol className="space-y-4">
        {instructions.map((instruction) => (
          <li key={instruction.step} className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-blue-600 text-white rounded-full font-semibold">
              {instruction.step}
            </div>
            <p className="flex-1 text-gray-700 dark:text-gray-300 pt-1">
              {instruction.description}
            </p>
          </li>
        ))}
      </ol>
    </div>
  );
}
