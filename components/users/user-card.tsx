import React from "react";
import Link from "next/link";
import Image from "next/image";
import { PublicUserProfile } from "@/types/profile";
import { SaveProfileButton } from "./save-profile-button";

interface UserCardProps {
  user: PublicUserProfile;
  currentUserId?: string | null;
}

export function UserCard({ user, currentUserId }: UserCardProps) {
  const isMe = currentUserId && user.id === currentUserId;
  const initial = (user.display_name || user.username || "U").charAt(0).toUpperCase();

  return (
    <div className="group relative rounded-xl border border-surface-border bg-surface-card p-5 hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/5 flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between gap-3 mb-4">
          <Link
            href={`/users/${user.username}`}
            className="flex items-center gap-3 min-w-0 flex-1 group-hover:text-primary transition-colors"
          >
            <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-full border border-surface-border bg-surface-muted flex items-center justify-center font-bold text-base text-primary">
              {user.avatar_url ? (
                <Image
                  src={user.avatar_url}
                  alt={user.display_name || user.username}
                  fill
                  sizes="48px"
                  className="object-cover"
                />
              ) : (
                <span>{initial}</span>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-gray-100 truncate text-base group-hover:text-primary transition-colors">
                {user.display_name || user.username}
              </h3>
              <p className="text-xs text-gray-400 truncate">@{user.username}</p>
            </div>
          </Link>

          {!isMe && (
            <SaveProfileButton
              targetProfileId={user.id}
              initialIsSaved={user.is_saved ?? false}
              size="sm"
              showText={false}
              className="flex-shrink-0"
            />
          )}
        </div>

        {/* Bio preview if public */}
        {user.is_profile_public && user.bio ? (
          <p className="text-xs text-gray-300 line-clamp-2 mb-4 leading-relaxed">
            {user.bio}
          </p>
        ) : (
          <p className="text-xs text-gray-500 italic mb-4">
            {user.is_profile_public ? "Sem biografia informada." : "Perfil privado"}
          </p>
        )}
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-surface-border/60 text-xs">
        <span
          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium ${
            user.is_profile_public
              ? "bg-accent-emerald/15 text-accent-emerald border border-accent-emerald/30"
              : "bg-surface-muted text-gray-400 border border-surface-border"
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              user.is_profile_public ? "bg-accent-emerald" : "bg-gray-500"
            }`}
          />
          {user.is_profile_public ? "Perfil Público" : "Perfil Privado"}
        </span>

        <Link
          href={`/users/${user.username}`}
          className="text-xs text-primary hover:text-primary-hover font-medium flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
        >
          Ver perfil
          <span>&rarr;</span>
        </Link>
      </div>
    </div>
  );
}

