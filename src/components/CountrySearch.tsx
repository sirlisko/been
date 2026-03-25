interface Props {
	value: string;
	onChange: (value: string) => void;
}

const CountrySearch = ({ value, onChange }: Props) => {
	return (
		<div className="flex justify-center my-6">
			<input
				type="text"
				placeholder="Search countries..."
				value={value}
				onChange={(e) => onChange(e.target.value)}
				className="w-full max-w-md px-5 py-2.5 rounded-full border-2 border-been outline-been text-base"
			/>
		</div>
	);
};

export default CountrySearch;
