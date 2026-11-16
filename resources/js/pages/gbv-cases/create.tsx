import { Head, Link } from "@inertiajs/react";
import { ArrowLeft, FilePlus2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/page-header";
import { GbvCaseForm } from "@/components/forms/gbv-case-form";

import { index as cases } from "@/routes/gbv-cases";

import type { GbvCasesCreateProps } from "@/types";

export default function GbvCasesCreate({ lookups, can }: GbvCasesCreateProps) {
    if (!can.create) {
        return (
            <>
                <Head title="Register GBV case" />
                <div className="flex flex-1 items-center justify-center p-6">
                    <p className="text-sm text-muted-foreground">
                        You do not have permission to register GBV cases.
                    </p>
                </div>
            </>
        );
    }

    return (
        <>
            <Head title="Register GBV case" />
            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <PageHeader
                    title="Register GBV case"
                    icon={
                        <div className="rounded-lg bg-primary/10 p-2 text-primary">
                            <FilePlus2 className="h-5 w-5" />
                        </div>
                    }
                    meta={<span>Add a new case record to the system</span>}
                    actions={
                        <Button variant="outline" size="sm" asChild>
                            <Link href={cases.url()}>
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back
                            </Link>
                        </Button>
                    }
                />

                <GbvCaseForm
                    mode="create"
                    lookups={lookups}
                    submitUrl="/gbv-cases"
                    cancelUrl={cases.url()}
                />
            </div>
        </>
    );
}

GbvCasesCreate.layout = {
    breadcrumbs: [
        { title: "GBV Cases", href: cases.url() },
        { title: "Register", href: "/gbv-cases/create" },
    ],
};
