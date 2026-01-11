import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { SessionDetail } from "../medical-agent/[sessionId]/page"
import { Button } from "@/components/ui/button"
import * as moment from 'moment';
import ViewReportDialog from "@/app/_component/ViewReportDialog";


type Props={
    historyList:SessionDetail[]
}

export function HistoryTable({historyList}:Props) {
  return (
    <Table>
      <TableCaption>Previous Consulation Reports</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[300px]">AI Medical Specialist</TableHead>
          <TableHead className="w-[400px]">Description</TableHead>
          <TableHead>Date</TableHead>
          <TableHead className="text-right">Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {historyList.map((record:SessionDetail,index:number) => (
          <TableRow key={index}>
            <TableCell className="font-medium">
              {typeof record.selectedDoctor === 'string' 
                ? record.selectedDoctor 
                : record.selectedDoctor?.specialist || 'Unknown Doctor'}
            </TableCell>
            <TableCell>{record.notes}</TableCell>
            <TableCell>{ moment(new Date(record.createdOn)).fromNow() }
</TableCell>
            <TableCell className="text-right"><ViewReportDialog record={record}/></TableCell>
          </TableRow>
        ))}
      </TableBody>
      {/* <TableFooter>
        <TableRow>
          <TableCell colSpan={3}>Total</TableCell>
          <TableCell className="text-right">$2,500.00</TableCell>
        </TableRow>
      </TableFooter> */}
    </Table>
  )
}
