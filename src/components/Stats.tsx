import { TOTAL_COUNTRIES } from "../utils/countries";

interface Props {
	count: number;
}

const Stats = ({ count }: Props) => {
	const percentage = ((count / TOTAL_COUNTRIES) * 100).toFixed(1);

	return (
		<p className="text-center text-lg my-4 font-sans">
			You have been in <strong>{count}</strong> countries, that's like{" "}
			<strong>{percentage}%</strong> of the World.
		</p>
	);
};

export default Stats;
