import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DataTable, type Column } from '@/components/features/school-admin/DataTable';

interface TestRow extends Record<string, unknown> {
  id: string;
  name: string;
  score: number;
  examDate: string;
}

const columns: Column<TestRow>[] = [
  { key: 'name', label: 'Name', sortable: true },
  { key: 'score', label: 'Score', sortable: true },
  { key: 'examDate', label: 'Date', sortable: true },
];

function firstDataRow() {
  return screen.getAllByRole('row')[1];
}

describe('DataTable', () => {
  it('sorts number and date columns with type-aware comparators', async () => {
    const user = userEvent.setup();
    const rows: TestRow[] = [
      { id: '1', name: 'Alice', score: 30, examDate: '2026-03-01' },
      { id: '2', name: 'Bob', score: 5, examDate: '2025-12-31' },
      { id: '3', name: 'Carol', score: 17, examDate: '2026-01-15' },
    ];

    render(<DataTable<TestRow> data={rows} columns={columns} rowKey={(row) => row.id} />);

    await user.click(screen.getByRole('columnheader', { name: /score/i }));
    expect(within(firstDataRow()).getByText('Bob')).toBeInTheDocument();

    await user.click(screen.getByRole('columnheader', { name: /score/i }));
    expect(within(firstDataRow()).getByText('Alice')).toBeInTheDocument();

    await user.click(screen.getByRole('columnheader', { name: /date/i }));
    expect(within(firstDataRow()).getByText('Bob')).toBeInTheDocument();

    await user.click(screen.getByRole('columnheader', { name: /date/i }));
    expect(within(firstDataRow()).getByText('Alice')).toBeInTheDocument();
  });

  it('keeps row selection stable across pagination, sort, and filter changes', async () => {
    const user = userEvent.setup();
    const rows: TestRow[] = [
      { id: '1', name: 'Alpha', score: 10, examDate: '2026-01-10' },
      { id: '2', name: 'Beta', score: 20, examDate: '2026-01-11' },
      { id: '3', name: 'Gamma', score: 30, examDate: '2026-01-12' },
      { id: '4', name: 'Delta', score: 40, examDate: '2026-01-13' },
    ];

    let latestSelection: TestRow[] = [];
    render(
      <DataTable<TestRow>
        data={rows}
        columns={columns}
        selectable
        pageSize={2}
        rowKey={(row) => row.id}
        onSelectionChange={(selected) => {
          latestSelection = selected as TestRow[];
        }}
      />,
    );

    await user.click(screen.getByLabelText('Next page'));
    const deltaRow = screen.getByText('Delta').closest('tr');
    expect(deltaRow).not.toBeNull();
    await user.click(within(deltaRow as HTMLTableRowElement).getByRole('checkbox'));
    expect(latestSelection.map((row) => row.id)).toEqual(['4']);

    await user.click(screen.getByLabelText('Previous page'));
    await user.click(screen.getByRole('columnheader', { name: /score/i }));
    expect(latestSelection.map((row) => row.id)).toEqual(['4']);

    await user.type(screen.getByPlaceholderText('Search...'), 'Delta');
    expect(latestSelection.map((row) => row.id)).toEqual(['4']);
    expect(await screen.findByText('Delta')).toBeInTheDocument();
  });
});
