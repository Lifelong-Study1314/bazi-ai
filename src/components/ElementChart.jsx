import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function ElementChart({ elements }) {
  const data = [
    { name: 'Wood', count: elements.counts.Wood },
    { name: 'Fire', count: elements.counts.Fire },
    { name: 'Earth', count: elements.counts.Earth },
    { name: 'Metal', count: elements.counts.Metal },
    { name: 'Water', count: elements.counts.Water }
  ];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="count" fill="#8884d8" />
      </BarChart>
    </ResponsiveContainer>
  );
}
