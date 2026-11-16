import { Head, Link } from "@inertiajs/react";
import { ArrowLeft, Pencil } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/page-header";
import { SurvivorForm } from "@/components/forms/survivor-form";

import { index as survivors } from "@/routes/survivors";

import type { Survivor, SurvivorsEditProps } from "@/types";

function displayName(s: Survivor): string {
    if (s.anonymous) return "Anonymous survivor";
    return s.full_name || s.unique_code;
}

export default function SurvivorsEdit({ survivor, can }: SurvivorsEditProps) {
    const editUrl = `/survivors/${survivor.id}`;

    if (!can.update) {
        return (
            <>
                <Head title={`Edit ${survivor.unique_code}`} />
                <div className="flex flex-1 items-center justify-center p-6">
                    <p className="text-sm text-muted-foreground">
                        You do not have permission to edit this survivor.
                    </p>
                </div>
            </>
        );
    }

    return (
        <>
            <Head title={`Edit ${survivor.unique_code}`} />
            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <PageHeader
                    title={`Edit ${displayName(survivor)}`}
                    icon={
                        <div className="rounded-lg bg-primary/10 p-2 text-primary">
                            <Pencil className="h-5 w-5" />
                        </div>
                    }
                    meta={<span>{survivor.unique_code}</span>}
                    actions={
                        <Button variant="outline" size="sm" asChild>
                            <Link href={editUrl}>
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back
                            </Link>
                        </Button>
                    }
                />

                <SurvivorForm
                    mode="edit"
                    survivor={survivor}
                    submitUrl={editUrl}
                    cancelUrl={editUrl}
                />
            </div>
        </>
    );
}

SurvivorsEdit.layout = {
    breadcrumbs: [{ title: "Survivors", href: survivors.url() }],
};
