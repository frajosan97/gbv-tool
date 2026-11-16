import { Head, Link } from "@inertiajs/react";
import { ArrowLeft, Pencil } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/page-header";
import { GbvCaseForm } from "@/components/forms/gbv-case-form";

import { index as cases } from "@/routes/gbv-cases";

import type { GbvCasesEditProps } from "@/types";

export default function GbvCasesEdit({
    case: gbvCase,
    lookups,
    can,
}: GbvCasesEditProps) {
    const editUrl = `/gbv-cases/${gbvCase.id}`;

    if (!can.update) {
        return (
            <>
                <Head title={`Edit ${gbvCase.case_number}`} />
                <div className="flex flex-1 items-center justify-center p-6">
                    <p className="text-sm text-muted-foreground">
                        You do not have permission to edit this case.
                    </p>
                </div>
            </>
        );
    }

    return (
        <>
            <Head title={`Edit ${gbvCase.case_number}`} />
            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <PageHeader
                    title={`Edit ${gbvCase.case_number}`}
                    icon={
                        <div className="rounded-lg bg-primary/10 p-2 text-primary">
                            <Pencil className="h-5 w-5" />
                        </div>
                    }
                    meta={<span>{gbvCase.incident_number ?? "—"}</span>}
                    actions={
                        <Button variant="outline" size="sm" asChild>
                            <Link href={editUrl}>
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back
                            </Link>
                        </Button>
                    }
                />

                <GbvCaseForm
                    mode="edit"
                    case={gbvCase}
                    lookups={lookups}
                    submitUrl={editUrl}
                    cancelUrl={editUrl}
                />
            </div>
        </>
    );
}

GbvCasesEdit.layout = {
    breadcrumbs: [{ title: "GBV Cases", href: cases.url() }],
};
