import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { SessionDetail } from "../medical-agent/[sessionId]/page"
import moment from "moment";
import ViewReportDialog from "@/app/_component/ViewReportDialog";

type Props = {
  historyList: SessionDetail[];
  startIndex?: number;
};

export function HistoryTable({ historyList, startIndex = 0 }: Props) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/70 hover:bg-muted/70">
            <TableHead className="w-[56px] text-muted-foreground">#</TableHead>
            <TableHead>Specialist</TableHead>
            <TableHead className="hidden md:table-cell">Notes</TableHead>
            <TableHead>When</TableHead>
            <TableHead className="text-right">Report</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {historyList.map((record: SessionDetail, index: number) => (
            <TableRow key={record.sessionId || index} className="hover:bg-brand-soft/60">
              <TableCell className="text-muted-foreground">
                {startIndex + index + 1}
              </TableCell>
              <TableCell className="font-medium text-foreground">
                {typeof record.selectedDoctor === "string"
                  ? record.selectedDoctor
                  : record.selectedDoctor?.specialist || "Unknown Doctor"}
              </TableCell>
              <TableCell className="hidden max-w-[280px] truncate text-muted-foreground md:table-cell">
                {record.notes || "—"}
              </TableCell>
              <TableCell className="whitespace-nowrap text-muted-foreground">
                {moment(new Date(record.createdOn)).fromNow()}
              </TableCell>
              <TableCell className="text-right">
                <ViewReportDialog record={record} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
