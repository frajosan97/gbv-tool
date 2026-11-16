import { Head, Link } from "@inertiajs/react";
import { ArrowLeft, UserPlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/page-header";
import { SurvivorForm } from "@/components/forms/survivor-form";

import { index as survivors } from "@/routes/survivors";

import type { SurvivorsCreateProps } from "@/types";

export default function SurvivorsCreate({ can }: SurvivorsCreateProps) {
    if (!can.create) {
        return (
            <>
                <Head title="Register survivor" />
                <div className="flex flex-1 items-center justify-center p-6">
                    <p className="text-sm text-muted-foreground">
                        You do not have permission to register survivors.
                    </p>
                </div>
            </>
        );
    }

    return (
        <>
            <Head title="Register survivor" />
            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <PageHeader
                    title="Register survivor"
                    icon={
                        <div className="rounded-lg bg-primary/10 p-2 text-primary">
                            <UserPlus className="h-5 w-5" />
                        </div>
                    }
                    meta={<span>Add a new survivor record to the system</span>}
                    actions={
                        <Button variant="outline" size="sm" asChild>
                            <Link href={survivors.url()}>
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back
                            </Link>
                        </Button>
                    }
                />

                <SurvivorForm
                    mode="create"
                    submitUrl="/survivors"
                    cancelUrl={survivors.url()}
                />
            </div>
        </>
    );
}

SurvivorsCreate.layout = {
    breadcrumbs: [
        { title: "Survivors", href: survivors.url() },
        { title: "Register", href: "/survivors/create" },
    ],
};
