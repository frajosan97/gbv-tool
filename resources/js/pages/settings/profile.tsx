import { Form, Head, usePage } from "@inertiajs/react";
import { Link } from "@inertiajs/react";
import { useRef, useState } from "react";
import ProfileController from "@/actions/App/Http/Controllers/Settings/ProfileController";
import DeleteUser from "@/components/delete-user";
import Heading from "@/components/heading";
import InputError from "@/components/input-error";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { edit } from "@/routes/profile";
import type { Auth } from "@/types";
import { send } from "@/routes/verification";

type PageProps = {
    auth: Auth;
};

export default function Profile({
    mustVerifyEmail,
    status,
}: {
    mustVerifyEmail: boolean;
    status?: string;
}) {
    const { auth } = usePage<PageProps>().props;

    const fileInputRef = useRef<HTMLInputElement>(null);
    const [preview, setPreview] = useState<string | null>(null);

    const currentAvatar = auth.user.avatar_url;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setPreview(URL.createObjectURL(file));
        }
    };

    return (
        <>
            <Head title="Profile settings" />

            <h1 className="sr-only">Profile settings</h1>

            <div className="space-y-6">
                <Heading
                    variant="small"
                    title="Profile"
                    description="Update your name, avatar and contact details"
                />

                <Form
                    {...ProfileController.update.form()}
                    options={{
                        preserveScroll: true,
                    }}
                    className="space-y-6"
                    encType="multipart/form-data"
                    onSuccess={() => {
                        setPreview(null);
                        if (fileInputRef.current) {
                            fileInputRef.current.value = "";
                        }
                    }}
                >
                    {({ processing, errors }) => (
                        <>
                            {/* Avatar */}
                            <div className="grid gap-2">
                                <Label htmlFor="avatar">Avatar</Label>

                                <div className="flex items-center gap-4">
                                    <img
                                        src={preview ?? currentAvatar}
                                        alt="Avatar"
                                        className="h-16 w-16 rounded-full object-cover ring-2 ring-border"
                                    />

                                    <div className="flex flex-col gap-2">
                                        <input
                                            ref={fileInputRef}
                                            id="avatar"
                                            name="avatar"
                                            type="file"
                                            accept="image/jpeg,image/png,image/webp"
                                            className="hidden"
                                            onChange={handleFileChange}
                                        />

                                        <div className="flex items-center gap-2">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() =>
                                                    fileInputRef.current?.click()
                                                }
                                            >
                                                Change avatar
                                            </Button>

                                            {auth.user.avatar && (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => {
                                                        if (
                                                            confirm(
                                                                "Remove your avatar?",
                                                            )
                                                        ) {
                                                            ProfileController.destroyAvatar();
                                                        }
                                                    }}
                                                >
                                                    Remove
                                                </Button>
                                            )}
                                        </div>

                                        <p className="text-xs text-muted-foreground">
                                            JPG, PNG or WebP. Max 2MB.
                                        </p>
                                    </div>
                                </div>

                                <InputError
                                    className="mt-2"
                                    message={errors.avatar}
                                />
                            </div>

                            {/* Name */}
                            <div className="grid gap-2">
                                <Label htmlFor="name">Name</Label>

                                <Input
                                    id="name"
                                    className="mt-1 block w-full"
                                    defaultValue={auth.user.name}
                                    name="name"
                                    required
                                    autoComplete="name"
                                    placeholder="Full name"
                                />

                                <InputError
                                    className="mt-2"
                                    message={errors.name}
                                />
                            </div>

                            {/* Email — read only */}
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email address</Label>

                                <Input
                                    id="email"
                                    type="email"
                                    className="mt-1 block w-full bg-muted"
                                    defaultValue={auth.user.email}
                                    name="email"
                                    readOnly
                                    disabled
                                    autoComplete="username"
                                    placeholder="Email address"
                                />

                                <p className="text-xs text-muted-foreground">
                                    Contact an administrator to change your
                                    email address.
                                </p>
                            </div>

                            {/* Phone */}
                            <div className="grid gap-2">
                                <Label htmlFor="phone">Phone number</Label>

                                <Input
                                    id="phone"
                                    type="tel"
                                    className="mt-1 block w-full"
                                    defaultValue={auth.user.phone}
                                    name="phone"
                                    required
                                    autoComplete="tel"
                                    placeholder="Phone number"
                                />

                                <InputError
                                    className="mt-2"
                                    message={errors.phone}
                                />
                            </div>

                            {mustVerifyEmail &&
                                auth.user.email_verified_at === null && (
                                    <div>
                                        <p className="-mt-4 text-sm text-muted-foreground">
                                            Your email address is unverified.{" "}
                                            <Link
                                                href={send()}
                                                as="button"
                                                className="text-foreground underline decoration-neutral-300 underline-offset-4 transition-colors duration-300 ease-out hover:decoration-current! dark:decoration-neutral-500"
                                            >
                                                Click here to re-send the
                                                verification email.
                                            </Link>
                                        </p>

                                        {status ===
                                            "verification-link-sent" && (
                                            <div className="mt-2 text-sm font-medium text-green-600">
                                                A new verification link has been
                                                sent to your email address.
                                            </div>
                                        )}
                                    </div>
                                )}

                            <div className="flex items-center gap-4">
                                <Button
                                    disabled={processing}
                                    data-test="update-profile-button"
                                >
                                    Save
                                </Button>
                            </div>
                        </>
                    )}
                </Form>
            </div>

            {/* <DeleteUser /> */}
        </>
    );
}

Profile.layout = {
    breadcrumbs: [
        {
            title: "Profile settings",
            href: edit(),
        },
    ],
};
